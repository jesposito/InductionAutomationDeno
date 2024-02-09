//app.ts
import { Application, Router } from 'https://deno.land/x/oak/mod.ts';
import * as dotenv from 'https://deno.land/x/dotenv/mod.ts';
import { CONFIG } from './config.ts';
import { fetchUserEmailFromSlack, postMessageToSlack } from './slackApi.ts';
import { fetchUserDataFromSmartsheet, fetchOnboardingPlan, markOnboardingComplete } from './smartsheetApi.ts';
import { createOnboardingMessage } from './onboardingUtils.ts';

// Load environment variables from your .env file
await dotenv.config({ safe: true });  

const app = new Application();
const router = new Router();

// Error Handling Middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err); 
    ctx.response.status = isHttpError(err) ? err.status : 500;
    ctx.response.body = { message: err.message || 'Internal Error' };
  }
});

router.post('/slack/events', async (context) => {
  const request = await context.request.body().value;

  if (request.type === 'url_verification') {
    context.response.body = request.challenge;
  } else if (request.event && request.event.type === 'member_joined_channel' && request.event.channel === CONFIG.ONBOARDING_CHANNEL_ID) {
    const userId = request.event.user.id;

    try {
      const userEmail = await fetchUserEmailFromSlack(userId);
      const { userData, onboardingPlanSheetId } = await fetchUserDataFromSmartsheet(userEmail);
      const onboardingPlan = await fetchOnboardingPlan(onboardingPlanSheetId);
      const onboardingMessage = createOnboardingMessage(onboardingPlan, userData);
      await postMessageToSlack(userId, onboardingMessage);

      // Additional functionalities like notifying a manager or sending an email can be implemented here
    } catch (error) {
      console.error("Error handling team_join event:", error);  
    }

    context.response.status = 200;
    context.response.body = { message: "Onboarding initiated" }; 
  } 
});

router.post('/slack/actions', async (context) => {
  const payload = JSON.parse(await context.request.body().value.payload);

  if (payload.type === 'block_actions' && payload.actions[0].action_id === 'complete_onboarding') {
    const userId = payload.user.id; 

    try {
      await markOnboardingComplete(userId); 
      context.response.status = 200;
      context.response.body = { message: "Onboarding marked as complete" };
    } catch (error) {
      console.error("Error marking onboarding as complete:", error);
      context.response.status = 500;
      context.response.body = { message: "Failed to mark onboarding as complete" };
    }
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = parseInt(Deno.env.get("PORT") || "8000");
console.log(`Server running on port ${PORT}`);
await app.listen({ port: PORT });
