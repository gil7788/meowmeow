"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
  targetDate: string
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  // Initialize with zeros to match server rendering
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Only start the timer on the client side
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - Date.now()

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      }
    }

    if (mounted) {
      setTimeLeft(calculateTimeLeft())

      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft())
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [targetDate, mounted])

  return (
    <div className="grid grid-cols-4 gap-2 text-center" suppressHydrationWarning>
      <div className="flex flex-col">
        <div className="text-2xl font-bold">{timeLeft.days}</div>
        <div className="text-xs text-muted-foreground">Days</div>
      </div>
      <div className="flex flex-col">
        <div className="text-2xl font-bold">{timeLeft.hours}</div>
        <div className="text-xs text-muted-foreground">Hours</div>
      </div>
      <div className="flex flex-col">
        <div className="text-2xl font-bold">{timeLeft.minutes}</div>
        <div className="text-xs text-muted-foreground">Mins</div>
      </div>
      <div className="flex flex-col">
        <div className="text-2xl font-bold">{timeLeft.seconds}</div>
        <div className="text-xs text-muted-foreground">Secs</div>
      </div>
    </div>
  )
}
