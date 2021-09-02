export const dateValidator = (dateToHide: string) => {
  if (!dateToHide) {
    return true;
  }
  const now = new Date();
  const expiryDate = new Date(dateToHide);
  if (expiryDate >= now) {
    return true;
  }
  return false;
};
