import React, { ReactNode, FC } from 'react'

interface DetailsProps {
  index: number
  title: string
  open: boolean
  description: ReactNode
}

const Details: FC<DetailsProps> = ({ index, title, description, open }) => {
  return (
    <details open={open} className={index > 0 ? 'mb-4' : ''}>
      <summary>
        <b>{title}</b>
      </summary>
      <p className="text-light">{description}</p>
    </details>
  )
}

export default Details
