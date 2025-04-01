import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { StorageEntityType } from "../../schema";
import { DataTable } from "../../components/data-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

function EntitiesPage() {
  const navigate = useNavigate();
  const [entities, setEntities] = useState([]);

  const columns: ColumnDef<StorageEntityType>[] = useMemo(
    () => [
      {
        accessorKey: "entity",
        header: "Entity",
        meta: {
          displayName: "Entity",
        },
        cell: ({ row }) => <div>{row.getValue("name")}</div>,
      },
      {
        accessorKey: "name",
        header: "Name",
        meta: {
          displayName: "Name",
        },
        cell: ({ row }) => {
          const value = row.original.data.name;
          return <div>{value}</div>;
        },
      },
      {
        accessorKey: "tin",
        header: "TIN",
        meta: {
          displayName: "TIN",
        },
        cell: ({ row }) => {
          const value = row.original.data.tin;
          return <div>{value}</div>;
        },
      },
      {
        accessorKey: "type",
        header: "ID Type",
        meta: {
          displayName: "ID Type",
        },
        cell: ({ row }) => {
          const value = row.original.data.type;
          return <div>{value}</div>;
        },
      },
      {
        accessorKey: "id",
        header: "ID",
        meta: {
          displayName: "ID",
        },
        cell: ({ row }) => {
          const value = row.original.data.id;
          return <div>{value}</div>;
        },
      },
      {
        accessorKey: "sst",
        header: "SST",
        meta: {
          displayName: "SST",
        },
        cell: ({ row }) => {
          const value = row.original.data.sst;
          return <div>{value}</div>;
        },
      },
      {
        accessorKey: "address",
        header: "Address",
        meta: {
          displayName: "Address",
        },
        cell: ({ row }) => {
          const value = row.original.data.address;
          return <div>{value}</div>;
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: {
          displayName: "Email",
        },
        cell: ({ row }) => {
          const value = row.original.data.email;
          return <div>{value}</div>;
        },
      },
      {
        accessorKey: "contactNumber",
        header: "Contact Number",
        meta: {
          displayName: "Contact Number",
        },
        cell: ({ row }) => {
          const value = row.original.data.contactNumber;
          return <div>{value}</div>;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const entity = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigate(`/entities/edit/${entity.hash}`)}
                >
                  Edit Entity
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this entity?")) {
                      chrome.storage.sync.get("entities", (result) => {
                        const data = result.entities || [];
                        const index = data.findIndex((item: StorageEntityType) => item.hash === entity.hash);
                        data.splice(index, 1);
                        chrome.storage.sync.set({ entities: data }, () => {
                          setEntities(data);
                        });
                      });
                    }
                  }}
                >
                  Delete Entity
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [navigate]
  );

  useEffect(() => {
    chrome.storage.sync.get("entities", (result) => {
      const data = result.entities || [];
      setEntities(data);
    });
  }, []);

  return (
    <>
      <DataTable columns={columns} data={entities} />
    </>
  );
}

export default EntitiesPage;
