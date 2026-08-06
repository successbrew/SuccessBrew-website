import ExcelJS from "exceljs";
import type { PersonalInfo, ProfessionalInfo } from "@/lib/types/application";

interface ExportableApplication {
  applicationCode: string;
  status: string;
  submittedAt: Date | null;
  categoryLabel: string;
  subCategoryLabel: string;
  personal: PersonalInfo;
  professional: ProfessionalInfo;
}

/** Generated in-memory on request — never written to disk or S3. */
export async function buildApplicationsWorkbook(applications: ExportableApplication[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Applications");

  sheet.columns = [
    { header: "Application Code", key: "applicationCode", width: 20 },
    { header: "Status", key: "status", width: 20 },
    { header: "Applied Date", key: "appliedDate", width: 16 },
    { header: "First Name", key: "firstName", width: 16 },
    { header: "Last Name", key: "lastName", width: 16 },
    { header: "Email", key: "email", width: 26 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "City", key: "city", width: 16 },
    { header: "Country", key: "country", width: 16 },
    { header: "Birthday", key: "birthday", width: 14 },
    { header: "Gender", key: "gender", width: 16 },
    { header: "Category", key: "category", width: 18 },
    { header: "Sub Category", key: "subCategory", width: 18 },
    { header: "Company", key: "company", width: 22 },
    { header: "Role", key: "role", width: 18 },
    { header: "Years Experience", key: "yearsExperience", width: 16 },
    { header: "Company Website", key: "companyWebsite", width: 30 },
    { header: "Industry", key: "industry", width: 18 },
    { header: "Revenue", key: "revenue", width: 16 },
    { header: "Funding Stage", key: "fundingStage", width: 16 },
    { header: "Team Size", key: "teamSize", width: 14 },
    { header: "Community Size", key: "communitySize", width: 16 },
    { header: "Speaking Experience", key: "speakingExperience", width: 20 },
    { header: "LinkedIn", key: "linkedin", width: 34 },
    { header: "Instagram", key: "instagram", width: 30 },
    { header: "Twitter/X", key: "twitter", width: 30 },
    { header: "YouTube", key: "youtube", width: 30 },
    { header: "Website", key: "website", width: 30 },
    { header: "Portfolio", key: "portfolio", width: 30 },
    { header: "Previous Podcasts", key: "podcastLinks", width: 30 },
    { header: "Articles", key: "articles", width: 30 },
    { header: "Headshot URL", key: "headshotUrl", width: 40 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const app of applications) {
    const socials = app.professional.socials;
    sheet.addRow({
      applicationCode: app.applicationCode,
      status: app.status,
      appliedDate: app.submittedAt ? app.submittedAt.toISOString().slice(0, 10) : "",
      firstName: app.personal.firstName,
      lastName: app.personal.lastName,
      email: app.personal.email,
      phone: app.personal.phone,
      city: app.personal.city,
      country: app.personal.country,
      birthday: app.personal.birthday ?? "",
      gender: app.personal.gender ?? "",
      category: app.categoryLabel,
      subCategory: app.subCategoryLabel,
      company: app.professional.companyName ?? "",
      role: app.professional.currentRole ?? "",
      yearsExperience: app.professional.yearsExperience ?? "",
      companyWebsite: app.professional.companyWebsite ?? "",
      industry: app.professional.industry ?? "",
      revenue: app.professional.revenue ?? "",
      fundingStage: app.professional.fundingStage ?? "",
      teamSize: app.professional.teamSize ?? "",
      communitySize: app.professional.communitySize ?? "",
      speakingExperience: app.professional.speakingExperience ?? "",
      linkedin: socials?.linkedin ?? "",
      instagram: socials?.instagram ?? "",
      twitter: socials?.twitter ?? "",
      youtube: socials?.youtube ?? "",
      website: socials?.website ?? "",
      portfolio: socials?.portfolio ?? "",
      podcastLinks: socials?.podcastLinks?.join(", ") ?? "",
      articles: socials?.articles?.join(", ") ?? "",
      headshotUrl: app.personal.headshotUrl ?? "",
    });
  }

  return workbook.xlsx.writeBuffer();
}
