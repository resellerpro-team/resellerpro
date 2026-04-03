'use client'

import React from 'react'
import { Filter, X, ArrowDownUp, Check } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type SortOption = 'newest' | 'price_low' | 'price_high'

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
  sortOption: SortOption
  onSortChange: (option: SortOption) => void
  primaryColor?: string
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
  filteredCount,
  sortOption,
  onSortChange,
  primaryColor = '#4f46e5'
}: FilterBarProps) {

  const sortLabels = {
    'newest': 'Newest Arrivals',
    'price_low': 'Price: Low to High',
    'price_high': 'Price: High to Low'
  }

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>Categories</span>
          <div className="flex-1 h-px bg-slate-100" />
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => onCategoryChange('all')}>
            <Checkbox 
              id="cat-all" 
              checked={selectedCategory === 'all'} 
              onCheckedChange={() => onCategoryChange('all')}
              className={selectedCategory === 'all' ? 'border-transparent text-white' : ''}
              style={selectedCategory === 'all' ? { backgroundColor: primaryColor } : {}}
            />
            <Label 
              htmlFor="cat-all" 
              className={`text-sm font-medium transition-colors cursor-pointer w-full group-hover:text-slate-900 ${selectedCategory === 'all' ? 'text-slate-900 font-bold' : 'text-slate-600'}`}
            >
              All Products
            </Label>
          </div>
          {categories.map((cat) => (
            <div key={cat} className="flex items-center space-x-3 group cursor-pointer" onClick={() => onCategoryChange(cat)}>
              <Checkbox 
                id={`cat-${cat}`} 
                checked={selectedCategory === cat} 
                onCheckedChange={() => onCategoryChange(cat)}
                className={selectedCategory === cat ? 'border-transparent text-white' : ''}
                style={selectedCategory === cat ? { backgroundColor: primaryColor } : {}}
              />
              <Label 
                htmlFor={`cat-${cat}`} 
                className={`text-sm font-medium transition-colors cursor-pointer w-full group-hover:text-slate-900 ${selectedCategory === cat ? 'text-slate-900 font-bold' : 'text-slate-600'}`}
              >
                {cat}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>Price Range</span>
          <div className="flex-1 h-px bg-slate-100" />
        </h3>
        <div className="px-2">
          <Slider
            defaultValue={[priceRange[0], priceRange[1]]}
            value={[priceRange[0], priceRange[1]]}
            max={maxPrice}
            step={10}
            onValueChange={(val) => onPriceChange(val as [number, number])}
            className="mt-6 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-md"
            style={{ '--tw-ring-color': primaryColor } as any}
          />
          <div className="flex justify-between mt-5">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              ₹{priceRange[0]}
            </span>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              ₹{priceRange[1] === maxPrice ? `${maxPrice}+` : priceRange[1]}
            </span>
          </div>
        </div>
      </div>

      {/* Sort Options (Desktop sidebar format) */}
      {!isMobile && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>Sort By</span>
            <div className="flex-1 h-px bg-slate-100" />
          </h3>
          <div className="space-y-2">
            {(Object.entries(sortLabels)).map(([key, label]) => (
              <button
                key={key}
                onClick={() => onSortChange(key as SortOption)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                  sortOption === key ? 'bg-slate-50 text-slate-900 font-bold border border-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                {label}
                {sortOption === key && <Check className="w-4 h-4" style={{ color: primaryColor }} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats / Clear */}
      <div className="pt-6 mt-6 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2">
          <span><span className="font-bold text-slate-900">{filteredCount}</span> results</span>
          { (selectedCategory !== 'all' || priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
            <button 
              onClick={() => {
                onCategoryChange('all')
                onPriceChange([0, maxPrice])
              }}
              className="hover:underline font-bold transition-colors"
              style={{ color: primaryColor }}
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
      <div className="flex gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex-1 items-center justify-center gap-2 rounded-xl h-11 border-slate-200 bg-white shadow-sm hover:bg-slate-50">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="font-bold text-slate-700">Filters</span>
              { (selectedCategory !== 'all' || priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
                <div className="w-2 h-2 rounded-full absolute top-3 right-4" style={{ backgroundColor: primaryColor }} />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-[2.5rem] p-6 pt-8 flex flex-col bg-white">
            <SheetHeader className="pb-6 shrink-0 relative">
              <div className="absolute top-[-44px] left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full" />
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-black text-slate-900">Filters</SheetTitle>
              </div>
              <SheetDescription className="text-slate-500 font-medium">
                Refine your search results
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto pb-6 scrollbar-hide">
              <FilterContent />
            </div>
            <SheetFooter className="mt-auto shrink-0 pt-4 border-t border-slate-100">
              <SheetClose asChild>
                <Button className="w-full h-14 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 text-base shadow-xl shadow-slate-900/10">
                  Show {filteredCount} Products
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Mobile Sort Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 items-center justify-center gap-2 rounded-xl h-11 border-slate-200 bg-white shadow-sm hover:bg-slate-50">
              <ArrowDownUp className="w-4 h-4 text-slate-600" />
              <span className="font-bold text-slate-700">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white/80 backdrop-blur-xl border border-slate-100 shadow-xl">
            {(Object.entries(sortLabels)).map(([key, label]) => (
              <DropdownMenuItem 
                key={key} 
                onClick={() => onSortChange(key as SortOption)}
                className={`rounded-xl px-4 py-3 cursor-pointer text-sm font-medium ${sortOption === key ? 'bg-slate-50 text-slate-900' : 'text-slate-600'}`}
              >
                <div className="flex items-center justify-between w-full">
                  {label}
                  {sortOption === key && <Check className="w-4 h-4" style={{ color: primaryColor }} />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 pb-2 rounded-[2rem] border border-slate-200/60 shadow-sm sticky top-28 w-full max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      <FilterContent />
    </div>
  )
}
