/**
 * StudentLayout — wrapper da área do aluno
 */
import StudentSidebar from './StudentSidebar'
import PageHeader from './PageHeader'

export default function StudentLayout({
  currentPage,
  onNavigate,
  breadcrumb,
  date,
  studentName,
  enrollment,
  accentColor,
  children,
}) {
  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <StudentSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        studentName={studentName}
        enrollment={enrollment}
        accentColor={accentColor}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader breadcrumb={breadcrumb} date={date} />
        <main className="flex-1 overflow-y-auto px-8 py-7">
          {children}
        </main>
      </div>
    </div>
  )
}
