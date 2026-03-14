'use client'

import React from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'

interface FilterBarProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  maxPrice: number
  isMobile?: boolean
  totalProducts: number
  filteredCount: number
}

export function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  maxPrice,
  isMobile,
  totalProducts,
  filteredCount
}: FilterBarProps) {

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Categories</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="cat-all" 
              checked={selectedCategory === 'all'} 
              onCheckedChange={() => onCategoryChange('all')}
            />
            <Label 
              htmlFor="cat-all" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              All Categories
            </Label>
          </div>
          {categories.map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox 
                id={`cat-${cat}`} 
                checked={selectedCategory === cat} 
                onCheckedChange={() => onCategoryChange(cat)}
              />
              <Label 
                htmlFor={`cat-${cat}`} 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {cat}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Price Range</h3>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
            ₹{priceRange[0]} - ₹{priceRange[1]}
          </span>
        </div>
        <div className="px-2">
          <Slider
            defaultValue={[priceRange[0], priceRange[1]]}
            value={[priceRange[0], priceRange[1]]}
            max={maxPrice}
            step={10}
            onValueChange={(val) => onPriceChange(val as [number, number])}
            className="mt-6"
          />
          <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase">
            <span>₹0</span>
            <span>₹{maxPrice}</span>
          </div>
        </div>
      </div>

      {/* Stats / Clear */}
      <div className="pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-4">
          <span>Found {filteredCount} products</span>
          { (selectedCategory !== 'all' || priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
            <button 
              onClick={() => {
                onCategoryChange('all')
                onPriceChange([0, maxPrice])
              }}
              className="text-indigo-600 hover:underline font-bold"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full flex items-center justify-center gap-2 rounded-xl h-12 border-slate-200">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            { (selectedCategory !== 'all' || priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
              <Badge variant="secondary" className="ml-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                Active
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-[2.5rem] p-8">
          <SheetHeader className="pb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-2xl font-black">Filters</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </SheetClose>
            </div>
            <SheetDescription className="text-slate-500 font-medium">
              Refine your search results
            </SheetDescription>
          </SheetHeader>
          <div className="py-2">
            <FilterContent />
          </div>
          <SheetFooter className="mt-8">
            <SheetClose asChild>
              <Button className="w-full h-12 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800">
                Show {filteredCount} Products
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
      <FilterContent />
    </div>
  )
}
