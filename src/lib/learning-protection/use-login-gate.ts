"use client";

import { useState } from "react";
import {
  LOGIN_GATE_AFTER_LEVEL,
  type LearningSession,
} from "./use-learning-progress";

export function useLoginGate({
  session,
  declinedLogin,
  setDeclinedLogin,
  tutorialActive,
  currentIndex,
  onAdvance,
}: {
  session: LearningSession;
  declinedLogin: boolean;
  setDeclinedLogin: (value: boolean) => void;
  tutorialActive: boolean;
  currentIndex: number;
  onAdvance: () => void;
}) {
  const [open, setOpen] = useState(false);

  const needsLogin = session.ready && !session.authenticated && !declinedLogin && !tutorialActive && currentIndex === LOGIN_GATE_AFTER_LEVEL - 1;

  const request = () => {
    if (!needsLogin) return false;
    setOpen(true);
    return true;
  };

  const onAuthenticated = () => {
    setOpen(false);
    onAdvance();
  };

  const onContinue = () => {
    setOpen(false);
    setDeclinedLogin(true);
    onAdvance();
  };

  return { open, request, onAuthenticated, onContinue };
}