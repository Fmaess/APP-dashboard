"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

// Wraps the BlueMForest page in a frame under a slim dashboard bar.
// A hash on this URL (e.g. /real-estate#fristen) opens that tab inside the page.
export default function ModuleFrame() {
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (frame.current) frame.current.src = "/real-estate/app" + window.location.hash;
  }, []);

  return (
    <>
      <div className="mini-bar">
        <Link className="btn" href="/">← Dashboard</Link>
        <span className="crumb">Real Estate · BlueMForest GbR</span>
      </div>
      <div className="frame-wrap">
        <iframe ref={frame} title="BlueMForest GbR" />
      </div>
    </>
  );
}
