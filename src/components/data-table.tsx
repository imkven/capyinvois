import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";
import { Columns2, Plus } from "lucide-react";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from "./ui/dropdown-menu";
import { Link } from "react-router";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showCreateButton?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showCreateButton = true,
}: DataTableProps<TData, TValue>) {
  const pagination = { pageIndex: 0, pageSize: 5 };
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    entity: true,
    name: true,
    tin: false,
    type: false,
    id: false,
    sst: false,
    address: false,
    email: false,
    contactNumber: false,
  });
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination,
      columnVisibility: {
        entity: true,
        name: true,
        tin: false,
        type: false,
        id: false,
        sst: false,
        address: false,
        email: false,
        contactNumber: false,
      },
    },
  });

  console.log('table', table)

  const columnsWithVisibility = useMemo(
    () => table.getAllColumns().filter((column) => column.getCanHide()),
    [table]
  );
  const shouldShowFilterInput = useMemo(
    () => data.length > pagination.pageSize,
    [pagination.pageSize, data]
  );

  return (
    <>
      <div className="mx-auto">
        {(shouldShowFilterInput || showCreateButton) && (
          <div className="flex items-center gap-x-2 mt-4">
            {shouldShowFilterInput && (
              <Input
                placeholder="Filter entity"
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            )}
            {showCreateButton && (
              <>
                {shouldShowFilterInput ? (
                  <Button variant="outline" className="p-2" asChild>
                    <Link to="/entities/create" className="ml-auto">
                      <Plus className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="p-4" asChild>
                    <Link to="/entities/create" className="ml-auto">
                      Add Entity
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-4">
          <Table className="border">
            <TableHeader className="bg-accent">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No entities.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {/* {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected. */}

            {columnsWithVisibility.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <Columns2 />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {columnsWithVisibility.map((column) => {
                    const displayName = (
                      column.columnDef.meta as { displayName?: string }
                    )?.displayName;
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {displayName}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
