export const equalSplit = (members) => ({
  mode: "equal",
  parts: members.map((m) => ({ memberId: m.id })),
});
export const moneyText = (cents) => (cents / 100).toFixed(2);
