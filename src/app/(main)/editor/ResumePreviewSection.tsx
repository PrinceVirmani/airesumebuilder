import ResumePreview from "@/components/ResumePreview";
import { ResumeVlaues } from "@/lib/validation";

interface ResumePreviewSectionProps {
  resumeData: ResumeVlaues;
  setResumeData: (data: ResumeVlaues) => void;
}

export default function ResumePreviewSection({
  resumeData,
  setResumeData,
}: ResumePreviewSectionProps) {
  return (
    <div className="hidden w-1/2 md:flex">
      <div className="bg-secondary flex w-full justify-center overflow-y-auto p-3">
        <ResumePreview
          resumeData={resumeData}
          className="max-w-2xl shadow-md"
        />
      </div>
    </div>
  );
}
