export type PlanFeatures = {
  artists: number;
  campaignsPerMonth: number;
  automations: boolean;
  integrations: boolean;
};

export const planFeatures: Record<"starter" | "pro" | "studio", PlanFeatures> = {
  starter: { artists: 1, campaignsPerMonth: 1, automations: false, integrations: false },
  pro: { artists: 3, campaignsPerMonth: 5, automations: true, integrations: true },
  studio: { artists: 10, campaignsPerMonth: 100, automations: true, integrations: true }
};
