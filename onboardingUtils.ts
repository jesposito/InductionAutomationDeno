interface OnboardingItem {
    Item: string;
    Description: string;
    Link?: string; // Make Link optional
  }
  
  export function createOnboardingMessage(onboardingPlan: OnboardingItem[], userData: any): any[] { // Define input/output data types
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Welcome ${userData.fullName}! We're excited to have you onboard.`,
        },
      },
      // Use consistent formatting for .map callback
      ...onboardingPlan.map((item, index) => ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${index + 1}. *${item.Item}:* ${item.Description}`,
        },
        accessory: item.Link
          ? {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'More info',
              },
              url: item.Link,
              action_id: `action_more_info_${index}`,
            }
          : null,
      })),
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Complete Onboarding',
            },
            value: 'complete_onboarding',
            action_id: 'complete_onboarding',
          },
        ],
      },
    ];
  
    return blocks.filter(block => block !== null);
  }
  