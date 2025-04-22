import { useEffect } from "react";
export default function ToolLoader() {
  useEffect(() => {
    async function getLoader() {
      const { waveform } = await import("ldrs");
      waveform.register();
    }
    getLoader();
  }, []);
  return (
    <l-waveform size="35" stroke="3.5" speed="1" color="black"></l-waveform>
  );
}
