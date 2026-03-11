'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { userService } from '@/lib/api/services/user'
import type {
  AdminSellerActionStatus,
  AdminSellerApplicationListParams,
  AdminSellerApplicationResponse,
  AdminSellerApplicationStatus,
  AdminUserType,
  AdminUserState,
} from '@/lib/api/types/admin'

const USER_TYPE_OPTIONS: { value: AdminUserType; label: string }[] = [
  { value: 'SELLER', label: '\uD310\uB9E4\uC790' },
  { value: 'CUSTOMER', label: '\uAD6C\uB9E4\uC790' },
  { value: 'ADMIN', label: '\uAD00\uB9AC\uC790' },
]

const USER_STATE_OPTIONS: { value: AdminUserState; label: string }[] = [
  { value: 'ACTIVE', label: '\uD65C\uC131' },
  { value: 'SUSPENDED', label: '\uC815\uC9C0' },
  { value: 'BLOCKED', label: '\uCC28\uB2E8' },
  { value: 'WITHDRAWN', label: '\uD0C8\uD1F4' },
]

const SELLER_STATUS_OPTIONS: { value: AdminSellerApplicationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '\uC804\uCCB4' },
  { value: 'PENDING', label: '\uC2B9\uC778 \uB300\uAE30' },
  { value: 'APPROVED', label: '\uC2B9\uC778' },
  { value: 'REJECTED', label: '\uAC70\uC808' },
  { value: 'SUSPENDED', label: '\uC815\uC9C0' },
]

const SELLER_ACTIONS: { value: AdminSellerActionStatus; label: string }[] = [
  { value: 'APPROVED', label: '\uC2B9\uC778' },
  { value: 'REJECTED', label: '\uAC70\uC808' },
  { value: 'SUSPENDED', label: '\uC815\uC9C0' },
]

const formatUserType = (value: AdminUserType) => {
  const match = USER_TYPE_OPTIONS.find((item) => item.value === value)
  return match ? match.label : value
}

const formatUserState = (value: AdminUserState) => {
  const match = USER_STATE_OPTIONS.find((item) => item.value === value)
  return match ? match.label : value
}

const formatSellerStatus = (value?: AdminSellerApplicationStatus | null) => {
  switch (value) {
    case 'PENDING':
      return '\uC2B9\uC778 \uB300\uAE30'
    case 'APPROVED':
      return '\uC2B9\uC778'
    case 'REJECTED':
      return '\uAC70\uC808'
    case 'SUSPENDED':
      return '\uC815\uC9C0'
    default:
      return '-'
  }
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [applications, setApplications] = useState<AdminSellerApplicationResponse[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [sort] = useState('userId,desc')
  const [sellerStatusFilter, setSellerStatusFilter] = useState<AdminSellerApplicationStatus | 'ALL'>(
    'PENDING'
  )
  const [actionTarget, setActionTarget] = useState<{
    application: AdminSellerApplicationResponse
    status: AdminSellerActionStatus
  } | null>(null)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      try {
        const currentUser = await userService.getCurrentUser()
        console.info('[AdminPage] current user role check:', {
          userId: currentUser.userId,
          role: currentUser.role,
        })
        if (currentUser.role !== 'ADMIN') {
          toast({
            title: '관리자 권한 없음',
            description: `현재 계정 role=${currentUser.role} 이므로 관리자 페이지에 접근할 수 없습니다.`,
            variant: 'destructive',
          })
          setIsAuthorized(false)
          router.replace('/')
          return
        }
        setIsAuthorized(true)
      } catch (error) {
        console.error('[AdminPage] current user role check failed:', error)
        const apiError = error as { status?: number; message?: string }
        toast({
          title: apiError.status === 401 ? '로그인 필요' : '권한 확인 실패',
          description:
            apiError.status === 401
              ? '관리자 인증 쿠키가 없거나 만료되었습니다. 다시 로그인해 주세요.'
              : apiError.message || '관리자 권한 확인 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
        setIsAuthorized(false)
        router.replace('/login')
      }
    }

    void checkRole()
  }, [router])

  const requestParams = useMemo<AdminSellerApplicationListParams>(
    () => ({
      sellerStatus: sellerStatusFilter === 'ALL' ? undefined : sellerStatusFilter,
      page,
      size,
      sort,
    }),
    [sellerStatusFilter, page, size, sort]
  )

  useEffect(() => {
    if (!isAuthorized) return

    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const data = await adminService.getSellerApplications(requestParams)
        setApplications(data.content || [])
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } catch (error) {
        console.error('[AdminPage] failed to load seller applications:', error)
        const apiError = error as { status?: number; message?: string }
        toast({
          title:
            apiError.status === 401
              ? '관리자 인증 필요'
              : '\uD310\uB9E4\uC790 \uC2E0\uCCAD \uBAA9\uB85D \uC870\uD68C \uC2E4\uD328',
          description:
            apiError.status === 401
              ? '관리자 세션이 없거나 권한이 없습니다. 다시 로그인 후 시도해 주세요.'
              : apiError.message || '\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    void fetchUsers()
  }, [isAuthorized, requestParams, toast])

  const handleStatusChange = async () => {
    if (!actionTarget) return
    setIsSubmitting(true)
    const submittedApplication = actionTarget.application
    const submittedStatus = actionTarget.status
    try {
      await adminService.updateSellerStatus(submittedApplication.userId, {
        sellerStatus: submittedStatus,
        reason: reason.trim() ? reason.trim() : undefined,
      })

      // 현재 PENDING 목록 화면에서는 승인/거절 완료 항목을 즉시 제거합니다.
      if (sellerStatusFilter === 'PENDING') {
        setApplications((prev) =>
          prev.filter((item) => item.userId !== submittedApplication.userId)
        )
        setTotalElements((prev) => Math.max(prev - 1, 0))
      }

      toast({
        title: '\uCC98\uB9AC \uC644\uB8CC',
        description: '\uC0C1\uD0DC\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
      })
      setActionTarget(null)
      setReason('')

      try {
        const data = await adminService.getSellerApplications(requestParams)
        setApplications(data.content || [])
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } catch (refreshError) {
        console.error('[AdminPage] seller status updated but refresh failed:', {
          userId: submittedApplication.userId,
          requestedStatus: submittedStatus,
          error: refreshError,
        })
        const apiError = refreshError as { status?: number; message?: string }
        toast({
          title: '목록 새로고침 실패',
          description:
            apiError.message ||
            '승인 상태 변경은 성공했지만 목록을 다시 불러오지 못했습니다. 새로고침해서 확인해 주세요.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[AdminPage] failed to update seller status:', {
        userId: submittedApplication.userId,
        requestedStatus: submittedStatus,
        error,
      })
      const apiError = error as { status?: number; message?: string }
      toast({
        title:
          apiError.status === 401
            ? '관리자 인증 필요'
            : '\uCC98\uB9AC \uC2E4\uD328',
        description:
          apiError.status === 401
            ? '상태 변경 요청이 401로 거절되었습니다. 관리자 로그인 쿠키/권한을 확인해 주세요.'
            : apiError.message ||
              '\uC0C1\uD0DC \uBCC0\uACBD\uC744 \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isActionEnabled = (
    application: AdminSellerApplicationResponse,
    action: AdminSellerActionStatus
  ) => {
    if (application.sellerStatus === 'PENDING') {
      return action === 'APPROVED' || action === 'REJECTED'
    }

    if (application.sellerStatus === 'APPROVED') {
      return action === 'SUSPENDED'
    }

    return action === 'APPROVED'
  }

  const isCurrentSellerAction = (
    application: AdminSellerApplicationResponse,
    status: AdminSellerActionStatus
  ) => {
    return application.sellerStatus === status
  }

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
              {'\uAD00\uB9AC\uC790 \uD310\uB9E4\uC790 \uC2E0\uCCAD \uAD00\uB9AC'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {
                '\uD310\uB9E4\uC790 \uC2E0\uCCAD \uC0C1\uD0DC\uB97C \uC870\uD68C\uD558\uACE0 \uC2B9\uC778/\uAC70\uC808/\uC815\uC9C0 \uCC98\uB9AC\uB97C \uC9C4\uD589\uD558\uC138\uC694.'
              }
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                value={sellerStatusFilter}
                onValueChange={(value) => {
                  setSellerStatusFilter(value as AdminSellerApplicationStatus | 'ALL')
                  setPage(0)
                }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder={'\uC2E0\uCCAD \uC0C1\uD0DC'} />
                </SelectTrigger>
                <SelectContent>
                  {SELLER_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {'\uCD1D '}{totalElements}
                {'\uAC74'}
              </p>
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
                <TableHead>Seller Status</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Business Reg No</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>{'\uC561\uC158'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                    {'\uB85C\uB529 \uC911...'}
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                    {'\uC870\uD68C \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.'}
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={application.userId}>
                    <TableCell className="font-mono text-xs">{application.userId}</TableCell>
                    <TableCell>{application.email}</TableCell>
                    <TableCell>{application.name || '-'}</TableCell>
                    <TableCell>{application.phone || '-'}</TableCell>
                    <TableCell>{formatUserType(application.userType)}</TableCell>
                    <TableCell>{formatUserState(application.userState)}</TableCell>
                    <TableCell>
                      {application.sellerStatus ? (
                        <Badge
                          variant={
                            application.sellerStatus === 'PENDING' ? 'default' : 'secondary'
                          }
                          className={
                            application.sellerStatus === 'PENDING' ? 'font-bold' : undefined
                          }
                        >
                          {formatSellerStatus(application.sellerStatus)}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{application.storeName || '-'}</TableCell>
                    <TableCell>{application.businessRegNo || '-'}</TableCell>
                    <TableCell>{application.businessOwnerName || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {SELLER_ACTIONS.map((action) => (
                          <Button
                            key={action.value}
                            type="button"
                            variant={
                              isCurrentSellerAction(application, action.value)
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            className={
                              isCurrentSellerAction(application, action.value)
                                ? 'font-bold'
                                : undefined
                            }
                            disabled={!isActionEnabled(application, action.value)}
                            onClick={() => {
                              setActionTarget({ application, status: action.value })
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
          <span>{`\uD398\uC774\uC9C0 ${page + 1} / ${Math.max(totalPages, 1)}`}</span>
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
                ? `\uC0AC\uC6A9\uC790 ${actionTarget.application.email} \uC0C1\uD0DC\uB97C \uBCC0\uACBD\uD569\uB2C8\uB2E4.`
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
