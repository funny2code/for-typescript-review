import { AuthUser } from "aws-amplify/auth";

export type UserParams = {
  user?: AuthUser; // Assuming the type of `user` as `any`, you can specify the appropriate type here
  signOut?: () => void; // Assuming `signOut` is a function with no return
};

export type Props = {
  authParams: UserParams;
};
