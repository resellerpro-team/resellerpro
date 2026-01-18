'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, LucideIcon } from 'lucide-react'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { ProBadge } from '@/components/shared/ProBadge'
import { UpgradePrompt } from '@/components/shared/UpgradePrompt'

interface ExportButtonProps {
  onExport: () => Promise<void> | void;
  label?: string;
  icon?: LucideIcon;
  featureName?: string;
  loading?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showProBadge?: boolean;
}

export function ExportButton({
  onExport,
  label = "Export CSV",
  icon: Icon = Download,
  featureName = "exporting data",
  loading = false,
  variant = "outline",
  size = "default",
  className,
  showProBadge = true,
}: ExportButtonProps) {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [internalExporting, setInternalExporting] = useState(false)
  const { isPremium, isLoading: isCheckingSubscription } = useSubscription()

  const isExporting = loading || internalExporting;

  const handleClick = async () => {
    if (!isPremium) {
      setShowUpgradePrompt(true)
      return
    }

    setInternalExporting(true);
    try {
      await onExport();
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setInternalExporting(false);
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isExporting || isCheckingSubscription}
        className={className}
      >
        {isExporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icon className="mr-2 h-4 w-4" />
        )}
        {label}
        {showProBadge && !isCheckingSubscription && !isPremium && <ProBadge />}
      </Button>

      <UpgradePrompt
        open={showUpgradePrompt}
        onOpenChange={setShowUpgradePrompt}
        feature={featureName}
      />
    </>
  )
}
