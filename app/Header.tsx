import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <div className="p-5 bg-blue-500">
      <Link href="/" className="text-2xl font-bold text-white">
        studymode
      </Link>
    </div>
  );
}
