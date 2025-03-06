import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import { WandSparklesIcon } from "lucide-react";
import { useState } from "react";
import { generateSummary } from "./action";
import { ResumeVlaues } from "@/lib/validation";

interface GenerateSummaryButtonProps {
  resumeData: ResumeVlaues;
  onSummaryGenerated: (summary: string) => void;
}

export default function GenerateSummaryButton({
  resumeData,
  onSummaryGenerated,
}: GenerateSummaryButtonProps) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);
      const aiResponse = await generateSummary(resumeData);
      onSummaryGenerated(aiResponse);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoadingButton
      variant="outline"
      type="button"
      onClick={handleClick}
      loading={loading}
    >
      <WandSparklesIcon className="size-4" />
      Generate (AI)
    </LoadingButton>
  );
}
