'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { adminService } from '@/lib/api/services/admin'
import { authService } from '@/lib/api/services/auth'
import type {
  AdminUserListParams,
  AdminUserSummaryResponse,
  AdminUserType,
  AdminUserState,
  AdminSellerStatus,
} from '@/lib/api/types/admin'

const USER_TYPE_OPTIONS: { value: AdminUserType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '\uC804\uCCB4' },
  { value: 'SELLER', label: '\uD310\uB9E4\uC790' },
  { value: 'CUSTOMER', label: '\uAD6C\uB9E4\uC790' },
  { value: 'ADMIN', label: '\uAD00\uB9AC\uC790' },
]

const USER_STATE_OPTIONS: { value: AdminUserState | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '\uC804\uCCB4' },
  { value: 'ACTIVE', label: '\uD65C\uC131' },
  { value: 'SUSPENDED', label: '\uC815\uC9C0' },
  { value: 'BLOCKED', label: '\uCC28\uB2E8' },
  { value: 'WITHDRAWN', label: '\uD0C8\uD1F4' },
]

const SELLER_ACTIONS: { value: AdminSellerStatus; label: string }[] = [
  { value: 'APPROVED', label: '\uC2B9\uC778' },
  { value: 'REJECTED', label: '\uAC70\uC808' },
  { value: 'SUSPENDED', label: '\uC815\uC9C0' },
]

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const formatUserType = (value: AdminUserType) => {
  const match = USER_TYPE_OPTIONS.find((item) => item.value === value)
  return match ? match.label : value
}

const formatUserState = (value: AdminUserState) => {
  const match = USER_STATE_OPTIONS.find((item) => item.value === value)
  return match ? match.label : value
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<AdminUserSummaryResponse[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [sort] = useState('createdAt,desc')
  const [typeFilter, setTypeFilter] = useState<AdminUserType | 'ALL'>('ALL')
  const [stateFilter, setStateFilter] = useState<AdminUserState | 'ALL'>('ALL')
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [actionTarget, setActionTarget] = useState<{
    user: AdminUserSummaryResponse
    status: AdminSellerStatus
  } | null>(null)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (currentUser.role !== 'ADMIN') {
          setIsAuthorized(false)
          router.replace('/')
          return
        }
        setIsAuthorized(true)
      } catch {
        setIsAuthorized(false)
        router.replace('/login')
      }
    }

    void checkRole()
  }, [router])

  const requestParams = useMemo<AdminUserListParams>(
    () => ({
      type: typeFilter === 'ALL' ? undefined : typeFilter,
      state: stateFilter === 'ALL' ? undefined : stateFilter,
      keyword: keyword.trim() ? keyword.trim() : undefined,
      page,
      size,
      sort,
    }),
    [typeFilter, stateFilter, keyword, page, size, sort]
  )

  useEffect(() => {
    if (!isAuthorized) return

    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const data = await adminService.getUsers(requestParams)
        setUsers(data.content || [])
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } catch (error) {
        console.error('Failed to load admin users:', error)
        toast({
          title: '\uC0AC\uC6A9\uC790 \uBAA9\uB85D \uC870\uD68C \uC2E4\uD328',
          description: '\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    void fetchUsers()
  }, [isAuthorized, requestParams, toast])

  const handleSearch = () => {
    setPage(0)
    setKeyword(keywordInput)
  }

  const handleStatusChange = async () => {
    if (!actionTarget) return
    setIsSubmitting(true)
    try {
      await adminService.updateSellerStatus(actionTarget.user.userId, {
        sellerStatus: actionTarget.status,
        reason: reason.trim() ? reason.trim() : undefined,
      })
      toast({
        title: '\uCC98\uB9AC \uC644\uB8CC',
        description: '\uC0C1\uD0DC\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
      })
      setActionTarget(null)
      setReason('')
      const data = await adminService.getUsers(requestParams)
      setUsers(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (error) {
      console.error('Failed to update seller status:', error)
      toast({
        title: '\uCC98\uB9AC \uC2E4\uD328',
        description:
          '\uC0C1\uD0DC \uBCC0\uACBD\uC744 \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSeller = (user: AdminUserSummaryResponse) => user.userType === 'SELLER'

  if (isAuthorized === false) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {'\uAD00\uB9AC\uC790 \uC0AC\uC6A9\uC790 \uAD00\uB9AC'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {
                '\uD544\uD130\uB97C \uC801\uC6A9\uD558\uC5EC \uC0AC\uC6A9\uC790 \uBAA9\uB85D\uC744 \uAD00\uB9AC\uD558\uC138\uC694.'
              }
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as AdminUserType | 'ALL')}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder={'\uC720\uD615'} />
                </SelectTrigger>
                <SelectContent>
                  {USER_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={stateFilter}
                onValueChange={(value) => setStateFilter(value as AdminUserState | 'ALL')}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder={'\uC0C1\uD0DC'} />
                </SelectTrigger>
                <SelectContent>
                  {USER_STATE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <Input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder={'\uC774\uBA54\uC77C \uB610\uB294 \uC774\uB984 \uAC80\uC0C9'}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleSearch()
                  }
                }}
              />
              <Button onClick={handleSearch} className="shrink-0">
                {'\uAC80\uC0C9'}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>User State</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>{'\uC561\uC158'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    {'\uB85C\uB529 \uC911...'}
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    {'\uC870\uD68C \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.'}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-mono text-xs">{user.userId}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name || '-'}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{formatUserType(user.userType)}</TableCell>
                    <TableCell>{formatUserState(user.userState)}</TableCell>
                    <TableCell>{formatDateTime(user.lastLoginAt)}</TableCell>
                    <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {SELLER_ACTIONS.map((action) => (
                          <Button
                            key={action.value}
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!isSeller(user)}
                            onClick={() => {
                              setActionTarget({ user, status: action.value })
                              setReason('')
                            }}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{`\uCD1D ${totalElements} \uAC74`}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page <= 0 || isLoading}
            >
              {'\uC774\uC804'}
            </Button>
            <span>{`${page + 1} / ${Math.max(totalPages, 1)}`}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
              disabled={page + 1 >= totalPages || isLoading}
            >
              {'\uB2E4\uC74C'}
            </Button>
            <Select
              value={String(size)}
              onValueChange={(value) => {
                setSize(Number(value))
                setPage(0)
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50].map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </main>

      <Dialog
        open={Boolean(actionTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setActionTarget(null)
            setReason('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{'\uC0C1\uD0DC \uBCC0\uACBD'}</DialogTitle>
            <DialogDescription>
              {actionTarget
                ? `\uC0AC\uC6A9\uC790 ${actionTarget.user.email} \uC0C1\uD0DC\uB97C \uBCC0\uACBD\uD569\uB2C8\uB2E4.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {actionTarget ? `\uC120\uD0DD\uB41C \uC561\uC158: ${actionTarget.status}` : ''}
            </p>
            <Textarea
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={'\uBCC0\uACBD \uC0AC\uC720 (\uC120\uD0DD)'}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setActionTarget(null)
                setReason('')
              }}
            >
              {'\uCDE8\uC18C'}
            </Button>
            <Button type="button" onClick={handleStatusChange} disabled={isSubmitting}>
              {isSubmitting ? '\uCC98\uB9AC \uC911...' : '\uD655\uC778'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
