export const DEFAULT_WHATSAPP_NUMBER = '09079622010';

export function whatsappUrl(
  phone = DEFAULT_WHATSAPP_NUMBER,
  message = 'Hello ZAHRA, I would like to enquire about catering for my event.',
) {
  const digits = phone.replace(/\D/g, '');
  const international = digits.startsWith('234')
    ? digits
    : `234${digits.replace(/^0/, '')}`;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}