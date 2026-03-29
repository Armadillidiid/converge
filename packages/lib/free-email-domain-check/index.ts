import {
  freeEmailDomains,
  freeEmailDomainsThatStartWithANumberObject,
} from "./free-email-domains.js";

/**
 * Checks if the given email is from a free email domain.
 * @param email - The email address to check.
 * @returns True if the email is from a free email domain, false otherwise.
 * @throws Error if the email format is invalid.
 */
export const checkIfFreeEmailDomain = (email: string): boolean => {
  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (!emailDomain) throw new Error("Invalid email format");

  // Gmail and Outlook are one of the most common email domains so we don't need to check the domains list
  if (emailDomain === "gmail.com" || emailDomain === "outlook.com") return true;

  const allFreeEmailDomains = freeEmailDomains.concat(
    Object.entries(freeEmailDomainsThatStartWithANumberObject).flatMap(
      ([_, value]) => value,
    ),
  );
  return allFreeEmailDomains.includes(emailDomain);
};
