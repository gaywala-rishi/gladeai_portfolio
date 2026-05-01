import SceneClient from "@/components/SceneClient";
import LoadingScreen from "@/components/ui/LoadingScreen";
import NavDots from "@/components/ui/NavDots";
import Panel from "@/components/ui/Panel";
import HintBar from "@/components/ui/HintBar";
import HelpModal from "@/components/ui/HelpModal";
import MobileNotice from "@/components/ui/MobileNotice";
import FallbackContent from "@/components/ui/FallbackContent";

export default function Home() {
  return (
    <main>
      <MobileNotice />
      <LoadingScreen />
      <SceneClient />
      <FallbackContent />
      <NavDots />
      <Panel />
      <HintBar />
      <HelpModal />
    </main>
  );
}
