"use client";

import { auth } from "@/pages/_app";
import { useStore } from "@/store";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";

// Prevent font awesome from adding extra css
config.autoAddCss = false;

export default function Header() {
  const { userRefs } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const signOut = async () => {
    await auth.signOut();
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const testQuery = async () => {
    if (!userRefs?.firebaseId) return;

    const query = new URLSearchParams({
      query: "protein",
      userId: userRefs.firebaseId,
    });
    const response = await fetch(`/api/embeddings?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
  };

  // TODO: Collapse Sources and Quizzes into Content/Search/Something
  // TODO: Write that component to use Pinecone for semantic search of sources and quizzes
  return (
    <header className="bg-blue-500">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <p className="text-2xl font-bold text-white">studymode</p>
          </Link>
          <div className="hidden md:flex">
            {userRefs?.loaded === false ? (
              <></>
            ) : userRefs?.firebaseId ? (
              <>
                <button onClick={testQuery} className="focus:outline-none">
                  Test Query
                </button>
                <Link href="/quizzes/new">
                  <p className="text-xl text-white p-5 transition ease-in-out duration-200 hover:text-blue-300">
                    Create
                  </p>
                </Link>
                <Link href="/sources">
                  <p className="text-xl text-white p-5 transition ease-in-out duration-200 hover:text-blue-300">
                    Sources
                  </p>
                </Link>
                <Link href="/quizzes">
                  <p className="text-xl text-white p-5 transition ease-in-out duration-200 hover:text-blue-300">
                    Quizzes
                  </p>
                </Link>
                <Link href="#" onClick={signOut}>
                  <p className="text-xl text-white p-5 transition ease-in-out duration-200 hover:text-blue-300">
                    Sign Out
                  </p>
                </Link>
              </>
            ) : (
              <Link href="/auth">
                <p className="text-xl text-white p-5 transition ease-in-out duration-200 hover:text-blue-300">
                  Sign In
                </p>
              </Link>
            )}
          </div>
          <button className="md:hidden focus:outline-none" onClick={toggleMenu}>
            <FontAwesomeIcon
              icon={isOpen ? faTimes : faBars}
              className="text-white text-xl"
            />
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4">
            {userRefs?.loaded === false ? (
              <></>
            ) : userRefs?.firebaseId ? (
              <>
                <Link href="/quizzes/new">
                  <p className="block text-xl text-white p-5 transition ease-in-out duration-200 hover:text-blue-300">
                    Create
                  </p>
                </Link>
                <Link href="/sources">
                  <p className="block text-xl text-white p-5 transition ease-in-out duration-200 hover:text-blue-300">
                    Sources
                  </p>
                </Link>
                <Link href="/quizzes">
                  <p className="block text-xl text-white p-5 transition ease-in-out duration-200 hover:text-blue-300">
                    Quizzes
                  </p>
                </Link>
                <Link href="#" onClick={signOut}>
                  <p className="block text-xl text-white p-5 transition ease-in-out duration-200 hover:text-blue-300">
                    Sign Out
                  </p>
                </Link>
              </>
            ) : (
              <Link href="/auth">
                <p className="block text-xl text-white p-5 transition ease-in-out duration-200 hover:text-blue-300">
                  Sign In
                </p>
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
