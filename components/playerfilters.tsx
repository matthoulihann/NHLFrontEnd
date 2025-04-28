"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface FilterProps {
  onFilterChange: (filters: any) => void
}

export default function PlayerFilters({ onFilterChange }: FilterProps) {
  const [position, setPosition] = useState("all")
  const [valueTier, setValueTier] = useState("all")

  const handlePositionChange = (value: string) => {
    setPosition(value)
    onFilterChange({ position: value, valueTier })
  }

  const handleValueTierChange = (value: string) => {
    setValueTier(value)
    onFilterChange({ position, valueTier: value })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="w-full sm:w-1/2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
        <Select value={position} onValueChange={handlePositionChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Positions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            <SelectItem value="F">Forward (F)</SelectItem>
            <SelectItem value="D">Defense (D)</SelectItem>
            <SelectItem value="G">Goalie (G)</SelectItem>
            <SelectItem value="C">Center (C)</SelectItem>
            <SelectItem value="LW">Left Wing (LW)</SelectItem>
            <SelectItem value="RW">Right Wing (RW)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-1/2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Value Tier</label>
        <Select value={valueTier} onValueChange={handleValueTierChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Value Tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Value Tiers</SelectItem>
            <SelectItem value="excellent">Excellent Value (80-100)</SelectItem>
            <SelectItem value="good">Good Value (65-79)</SelectItem>
            <SelectItem value="fair">Fair Value (50-64)</SelectItem>
            <SelectItem value="below-average">Below Average (35-49)</SelectItem>
            <SelectItem value="poor">Poor Value (0-34)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
