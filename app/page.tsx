'use client'

import React, { useEffect, useState } from 'react'
import { useStore } from '../store'
import { topics } from '../constants/topics'

export default function Home() {
    const { userId } = useStore()
    const [index, setIndex] = React.useState(0)
    const [subject, setSubject] = React.useState(topics[0])
    const [text, setText] = useState('')
    const [increase, setIncrease] = useState(true)
    const [wait, setWait] = useState(false)

    useEffect(() => {
        if (wait) {
            setTimeout(() => {
                setWait(false)
                setIncrease(false)
            }, 2000)
        }
    }, [wait])

    useEffect(() => {
        if (!increase && text.length > 0) {
            const reverseAnimation = setInterval(() => {
                setText(text.slice(0, -1))
                if (text.length === 1) {
                    setIncrease(true)
                    clearInterval(reverseAnimation)
                    setIndex((index + 1) % topics.length)
                    setSubject(topics[index])
                }
            }, 50)
            return () => clearInterval(reverseAnimation)
        }
    }, [text, increase])

    useEffect(() => {
        let targetText = subject
        let index = 0
        if (increase && text !== targetText) {
            const fowardAnimation = setInterval(() => {
                setText((t) => (t += targetText[index - 1]))
                index++
                if (index === targetText.length) {
                    clearInterval(fowardAnimation)
                    setWait(true)
                }
            }, 50)
            return () => clearInterval(fowardAnimation)
        }
    }, [increase])

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div>
                <p className="text-xl font-sm">I want to learn...</p>
            </div>
            <div className="text-center">
                <h1
                    className={` text-5xl font-bold text-gray-800 h-14 w-screen`}
                >
                    {text}
                </h1>
                <p className="text-lg font-medium text-gray-600">
                    Learn smarter, not harder.
                </p>
            </div>

            <div className="mt-10">
                <p className="text-lg font-medium text-gray-600">
                    Create quizzes from your own sources, and test yourself to
                    retain information.
                </p>
                <p className="text-lg font-medium text-gray-600">
                    Say goodbye to boring memorization and hello to effective
                    learning.
                </p>
            </div>

            <div className="mt-10">
                <a
                    href={`${userId ? '/quizzes' : '/auth'}`}
                    className="btn bg-blue-500 text-white py-4 px-4 rounded"
                >
                    Get Started
                </a>
            </div>
        </div>
    )
}
