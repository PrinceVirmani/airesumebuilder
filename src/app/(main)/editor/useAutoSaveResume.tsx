// import useDebounce from "@/hooks/useDebounce";
// import { ResumeVlaues } from "@/lib/validation";
// import { useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { saveResume } from "./action";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";

// export default function useAutoSaveResume(resumeData: ResumeVlaues) {
//   const searchParams = useSearchParams();

//   const { toast } = useToast();

//   const debouncedResumeData = useDebounce(resumeData, 1500);

//   const [resumeId, setResumeId] = useState(resumeData.id);

//   const [lastSavedData, setLastSavedData] = useState(
//     structuredClone(resumeData),
//   );

//   const [isSaving, setIsSaving] = useState(false);
//   const [isError, setIsError] = useState(false);

//   useEffect(() => {
//     setIsError(false);
//   }, [debouncedResumeData]);

//   useEffect(() => {
//     async function save() {
//       try {
//         setIsSaving(true);
//         setIsError(false);
//         const newData = structuredClone(debouncedResumeData);
//         const updateResume = await saveResume({
//           ...newData,
//           ...(JSON.stringify(lastSavedData.photo) ===
//             JSON.stringify(newData.photo) && {
//             photo: undefined,
//           }),
//           id: resumeId,
//         });

//         setResumeId(updateResume.id);
//         setLastSavedData(newData);

//         if (searchParams.get("resumeId") !== updateResume.id) {
//           const newSearchParams = new URLSearchParams(searchParams);
//           newSearchParams.set("resumeId", updateResume.id);
//           window.history.replaceState(
//             null,
//             "",
//             `?${newSearchParams.toString()}`,
//           );
//         }
//       } catch (error) {
//         setIsError(true);
//         const { dismiss } = toast({
//           variant: "destructive",
//           description: (
//             <div className="space-y-3">
//               <p>Could not save changes</p>
//               <Button
//                 variant="secondary"
//                 onClick={() => {
//                   dismiss();
//                   save();
//                 }}
//               >
//                 Retry
//               </Button>
//             </div>
//           ),
//         });
//       } finally {
//         setIsSaving(false);
//       }
//     }

//     const hasUnsavedChanges =
//       JSON.stringify(debouncedResumeData) !== JSON.stringify(lastSavedData);

//     if (hasUnsavedChanges && debouncedResumeData && isSaving && !isError) {
//       save();
//     }
//   }, [
//     debouncedResumeData,
//     isSaving,
//     lastSavedData,
//     isError,
//     resumeId,
//     searchParams,
//     toast,
//   ]);

//   return {
//     isSaving,
//     hasUnsavedChanges:
//       JSON.stringify(resumeData) !== JSON.stringify(lastSavedData),
//   };
// }
import useDebounce from "@/hooks/useDebounce";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { saveResume } from "./action";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ResumeVlaues } from "@/lib/validation";
import { fileReplacer } from "@/lib/utils";

export default function useAutoSaveResume(resumeData: ResumeVlaues) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const debouncedResumeData = useDebounce(resumeData, 1500);

  const [resumeId, setResumeId] = useState(resumeData.id);
  const [lastSavedData, setLastSavedData] = useState(
    structuredClone(resumeData),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsError(false);
  }, [debouncedResumeData]);

  useEffect(() => {
    setResumeId(resumeData.id);
  }, [resumeData.id]);

  useEffect(() => {
    async function save() {
      try {
        setIsSaving(true);
        setIsError(false);

        const newData = structuredClone(debouncedResumeData);

        // ✅ Ensure skills is always an array
        if (!Array.isArray(newData.skills)) {
          newData.skills = [];
        }

        // Call saveResume to update the backend
        const updatedResume = await saveResume({
          ...newData,
          ...(JSON.stringify(lastSavedData.photo, fileReplacer) ===
            JSON.stringify(newData.photo, fileReplacer) && {
            photo: undefined,
          }),
          id: resumeId,
        });

        console.log("Resume saved successfully:", updatedResume);

        // Update resumeId state with the new ID
        setResumeId(updatedResume.id);
        setLastSavedData(structuredClone(newData));

        // ✅ Update search params in the URL manually
        const currentParams = new URLSearchParams(window.location.search);
        if (currentParams.get("resumeId") !== updatedResume.id) {
          currentParams.set("resumeId", updatedResume.id);
          window.history.replaceState(null, "", `?${currentParams.toString()}`);
        }
      } catch (error) {
        console.error("Error saving resume:", error);
        setIsError(true);
        const { dismiss } = toast({
          variant: "destructive",
          description: (
            <div className="space-y-3">
              <p>Could not save changes</p>
              <Button
                variant="secondary"
                onClick={() => {
                  dismiss();
                  save();
                }}
              >
                Retry
              </Button>
            </div>
          ),
        });
      } finally {
        setIsSaving(false);
      }
    }

    console.log(JSON.stringify(debouncedResumeData, fileReplacer));
    console.log(JSON.stringify(lastSavedData, fileReplacer));

    const hasUnsavedChanges =
      JSON.stringify(debouncedResumeData, fileReplacer) !==
      JSON.stringify(lastSavedData, fileReplacer);

    // ✅ Ensure save is triggered properly when there are changes
    if (hasUnsavedChanges && debouncedResumeData && !isError) {
      save();
    }
  }, [debouncedResumeData, lastSavedData, isError, resumeId, toast]);

  return {
    isSaving,
    hasUnsavedChanges:
      JSON.stringify(resumeData) !== JSON.stringify(lastSavedData),
  };
}
