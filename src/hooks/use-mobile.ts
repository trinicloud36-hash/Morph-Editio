import { useEffect, useState } from "react"

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    setIsMobile(mq.matches)

    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
