import { useEffect, useState } from "react";
import { Modal } from "../Modal/Modal.tsx";

export function Cooldown({ isOnCooldown }: { isOnCooldown: boolean }) {
  const [isCooldownModalOpen, setIsCooldownModalOpen] = useState(false);

  useEffect(() => {
    setIsCooldownModalOpen(isOnCooldown);
  }, [isOnCooldown]);

  return (
    <Modal
      isOpen={isCooldownModalOpen}
      onClose={() => {
        setIsCooldownModalOpen(false);
      }}
      title="Cooldown 🧊"
      lockFocusAcrossFrames
    >
      <p>You were too fast! You are on cooldown.</p>
    </Modal>
  );
}
