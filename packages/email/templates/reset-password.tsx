import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type ResetPasswordTemplateProps = {
  readonly email: string;
  readonly hash: string;
};

export const ResetPasswordTemplate = ({
  email,
  hash,
}: ResetPasswordTemplateProps) => {
  const frontendURL =
    process.env["APP_FRONTEND_URL"] ?? "http://localhost:3000";
  const resetURL = new URL("/auth/reset-password", frontendURL);
  resetURL.searchParams.append("token", hash);

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Reset your password - Converge</Preview>
        <Body className="bg-zinc-50 font-sans">
          <Container className="mx-auto py-12">
            <Section className="mt-8 rounded-md bg-zinc-200 p-px">
              <Section className="rounded-[5px] bg-white p-8">
                <Text className="mt-0 mb-1 text-xs font-semibold tracking-[0.24em] uppercase text-zinc-500">
                  Converge
                </Text>
                <Heading className="mt-0 mb-4 text-2xl font-semibold text-teal-600">
                  Reset your password
                </Heading>
                <Text className="m-0 text-zinc-700">Hi, {email}!</Text>
                <Text className="m-0 mt-4 text-zinc-500">
                  We received a request to reset your password. Click the button
                  below to create a new password.
                </Text>
                <Section className="mt-6 text-center">
                  <Button
                    className="rounded-md bg-teal-600 px-6 py-3 font-medium text-white"
                    href={resetURL.toString()}
                  >
                    Reset password
                  </Button>
                </Section>
                <Text className="mt-6 text-sm text-zinc-500">
                  If you did not request a password reset, you can safely ignore
                  this email. Your password will not be changed.
                </Text>
                <Hr className="my-6" />
                <Text className="m-0 text-xs text-zinc-400">
                  This link will expire in 1 hour. If the button above
                  doesn&apos;t work, copy and paste this URL into your browser:
                </Text>
                <Link
                  className="mt-1 block text-xs text-amber-600 underline"
                  href={resetURL.toString()}
                >
                  {resetURL.toString()}
                </Link>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

ResetPasswordTemplate.PreviewProps = {
  email: "john.doe@example.com",
  hash: "xyz789abc123",
} as const;

ResetPasswordTemplate.displayName = "ResetPasswordTemplate" as const;

export default ResetPasswordTemplate;
