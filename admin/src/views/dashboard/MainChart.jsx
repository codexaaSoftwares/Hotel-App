import React, { useEffect, useRef } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

const MainChart = ({ points = [] }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    })
  }, [chartRef])

  const fallbackPoints = () => {
    const output = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      output.push({
        date: date.toISOString().split('T')[0],
        amount: 0,
      })
    }
    return output
  }

  const effectivePoints = points.length > 0 ? points : fallbackPoints()

  const labels = effectivePoints.map((point) => {
    const date = new Date(point.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const revenueData = effectivePoints.map((point) => point.amount)

  return (
    <CChartLine
      ref={chartRef}
      style={{ height: '300px', marginTop: '40px' }}
      data={{
        labels,
        datasets: [
          {
            label: 'Revenue ($)',
            backgroundColor: `rgba(${getStyle('--cui-success-rgb')}, .1)`,
            borderColor: getStyle('--cui-success'),
            pointHoverBackgroundColor: getStyle('--cui-success'),
            borderWidth: 3,
            data: revenueData,
            fill: true,
            tension: 0.4,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              color: getStyle('--cui-body-color'),
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: getStyle('--cui-body-bg'),
            titleColor: getStyle('--cui-body-color'),
            bodyColor: getStyle('--cui-body-color'),
            borderColor: getStyle('--cui-border-color'),
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: {
              color: getStyle('--cui-border-color-translucent'),
              drawOnChartArea: false,
            },
            ticks: {
              color: getStyle('--cui-body-color'),
              maxTicksLimit: 10,
            },
          },
          y: {
            beginAtZero: true,
            border: {
              color: getStyle('--cui-border-color-translucent'),
            },
            grid: {
              color: getStyle('--cui-border-color-translucent'),
            },
            ticks: {
              color: getStyle('--cui-body-color'),
              maxTicksLimit: 6,
              callback(value) {
                return '$' + Number(value).toLocaleString()
              },
            },
          },
        },
        elements: {
          line: {
            tension: 0.4,
          },
          point: {
            radius: 3,
            hitRadius: 10,
            hoverRadius: 6,
            hoverBorderWidth: 2,
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      }}
    />
  )
}

export default MainChart
