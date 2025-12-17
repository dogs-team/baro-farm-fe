'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wallet } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface DepositChargeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chargeAmount: string
  onChargeAmountChange: (amount: string) => void
  depositBalance: number | null
  isCharging: boolean
  onCharge: () => Promise<void>
  trigger?: React.ReactNode
}

export function DepositChargeDialog({
  open,
  onOpenChange,
  chargeAmount,
  onChargeAmountChange,
  depositBalance,
  isCharging,
  onCharge,
  trigger,
}: DepositChargeDialogProps) {
  const handleAmountClick = (amount: number) => {
    onChargeAmountChange(amount.toLocaleString())
  }

  const handleClose = () => {
    onOpenChange(false)
    onChargeAmountChange('')
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="cursor-pointer text-xs h-8 px-2">
      <Wallet className="h-3 w-3 mr-1" />
      충전
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>예치금 충전</DialogTitle>
          <DialogDescription>충전할 금액을 입력해주세요. (최소 1,000원)</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="chargeAmount">충전 금액</Label>
            <Input
              id="chargeAmount"
              type="text"
              placeholder="10,000"
              value={chargeAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '')
                if (value) {
                  onChargeAmountChange(parseInt(value, 10).toLocaleString())
                } else {
                  onChargeAmountChange('')
                }
              }}
              disabled={isCharging}
            />
            <div className="flex gap-2">
              {[10000, 50000, 100000, 500000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleAmountClick(amount)}
                  disabled={isCharging}
                  className="cursor-pointer"
                >
                  {amount.toLocaleString()}원
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              현재 잔액: {typeof depositBalance === 'number' ? depositBalance.toLocaleString() : 0}
              원
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCharging}
            className="cursor-pointer"
          >
            취소
          </Button>
          <Button
            onClick={onCharge}
            disabled={isCharging || !chargeAmount}
            className="cursor-pointer"
          >
            {isCharging ? '충전 중...' : '충전하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
