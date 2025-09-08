export type AuthStackParamList = {
  Login: undefined;
  EmailInput: undefined;
  MagicLinkSent: {email: string};
};

export type HomeStackParamList = {
  TabNavigator: undefined;
  Dashboard: undefined;
  Settings: undefined;
  Payments: undefined;
  PaymentsList: undefined;
  Stripe: undefined;
  RevenueCat: undefined;
  Profile: undefined;
  Feedback: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  ErrorScreen: {
    title: string;
    message: string;
    action: 'retry' | 'login' | 'back' | 'home';
  };
};
