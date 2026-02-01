'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export function FinancialDateFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Parse existing params or default to current month
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    const parseDateParam = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number)
        return new Date(year, month - 1, day)
    }

    const dateRange = fromParam && toParam
        ? {
            start: parseDateParam(fromParam),
            end: parseDateParam(toParam),
        }
        : {
            start: startOfMonth(new Date()),
            end: endOfMonth(new Date()),
        }

    const handleDateChange = (range: { start: Date; end: Date } | null) => {
        const params = new URLSearchParams(searchParams.toString())

        if (range) {
            params.set('from', format(range.start, 'yyyy-MM-dd'))
            params.set('to', format(range.end, 'yyyy-MM-dd'))
        } else {
            params.delete('from')
            params.delete('to')
        }

        router.push(`?${params.toString()}`)
        router.refresh()
    }

    return (
        <DateRangePicker
            value={dateRange}
            onChange={handleDateChange}
        />
    )
}
