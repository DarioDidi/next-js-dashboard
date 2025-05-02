import LatestInvoices from "@/app/ui/dashboard/latest-invoices";
import RevenueChart from "@/app/ui/dashboard/revenue-chart";
import { lusitana } from "@/app/ui/fonts";
import { fetchCardData } from "@/app/lib/data";
import { Suspense } from "react";
import { LatestInvoicesSkeleton, RevenueChartSkeleton, CardsSkeleton } from "@/app/ui/skeletons";
import CardWrapper from "@/app/ui/dashboard/cards";

export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-x1 md:text2l`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:gird-cols-8">
        {<Suspense fallback={<RevenueChartSkeleton />}><RevenueChart /></Suspense>}
        {<Suspense fallback={<LatestInvoicesSkeleton />}><LatestInvoices /> </Suspense>}
      </div>
    </main >
  );
}
