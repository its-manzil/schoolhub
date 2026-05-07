export const getAccountingBasePath = (role: string | null) => {
  switch (role?.toLowerCase()) {
    case "schooladmin":
      return "/SchoolAdmin/Accounting";
    case "teacher":
      return "/Teacher/Accounting";
    default:
      return "/Accounting";
  }
};
