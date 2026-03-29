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

type VerifyEmailTemplateProps = {
  readonly email: string;
  readonly hash: string;
};

export const VerifyEmailTemplate = ({
  email,
  hash,
}: VerifyEmailTemplateProps) => {
  const frontendURL =
    process.env["APP_FRONTEND_URL"] ?? "http://localhost:3000";
  const verificationURL = new URL("/auth/verify-email", frontendURL);
  verificationURL.searchParams.append("token", hash);

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Confirm your email - Converge</Preview>
        <Body className="bg-zinc-50 font-sans">
          <Container className="mx-auto py-12">
            <Section className="mt-8 rounded-md bg-zinc-200 p-px">
              <Section className="rounded-[5px] bg-white p-8">
                <Text className="mt-0 mb-1 text-xs font-semibold tracking-[0.24em] uppercase text-zinc-500">
                  Converge
                </Text>
                <Heading className="mt-0 mb-4 text-2xl font-semibold text-amber-600">
                  Confirm your email
                </Heading>
                <Text className="m-0 text-zinc-700">
                  Thank you for signing up, {email}!
                </Text>
                <Text className="m-0 mt-4 text-zinc-500">
                  Click the button below to verify your email address and
                  activate your account.
                </Text>
                <Section className="mt-6 text-center">
                  <Button
                    className="rounded-md bg-amber-500 px-6 py-3 font-medium text-white"
                    href={verificationURL.toString()}
                  >
                    Verify email address
                  </Button>
                </Section>
                <Text className="mt-6 text-sm text-zinc-500">
                  If you did not create an account with Converge, you can
                  safely ignore this email.
                </Text>
                <Hr className="my-6" />
                <Text className="m-0 text-xs text-zinc-400">
                  This link will expire in 24 hours. If the button above
                  doesn&apos;t work, copy and paste this URL into your browser:
                </Text>
                <Link
                  className="mt-1 block text-xs text-teal-600 underline"
                  href={verificationURL.toString()}
                >
                  {verificationURL.toString()}
                </Link>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

VerifyEmailTemplate.PreviewProps = {
  email: "john.doe@example.com",
  hash: "abc123def456",
} as const;

VerifyEmailTemplate.displayName = "VerifyEmailTemplate" as const;

export default VerifyEmailTemplate;
