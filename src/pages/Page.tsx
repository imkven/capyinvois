import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  CircleX,
  CircleAlert,
  CircleHelp,
  CircleCheck,
  Square,
  SquareCheck,
} from "lucide-react";
import {
  StorageEntityDataType,
  StorageEntityType,
  StorageEntityWithErrorsType,
} from "../schema";
import { DataTable } from "../components/data-table";
import { Button } from "../components/ui/button";
import { ColumnDef } from "@tanstack/react-table";

function LandingPage() {
  const [alert, setAlert] = useState<{
    type: "error" | "success" | "info" | "warning";
    title: string;
    description: string;
  } | null>(null);
  const [originalEntities, setOriginalEntities] = useState<StorageEntityType[]>(
    []
  );
  const [matchedEntities, setMatchedEntities] = useState<
    StorageEntityWithErrorsType[]
  >([]);
  const [selectedEntity, setSelectedEntity] =
    useState<StorageEntityWithErrorsType | null>(null);
  const [buyerInfo, setBuyerInfo] = useState<StorageEntityDataType | null>(
    null
  );
  const [tabId, setTabId] = useState<number | null>(null);

  const compareEntities = (
    a: StorageEntityDataType,
    b: StorageEntityDataType
  ) => {
    const errors = [];
    for (const [key, value] of Object.entries(a)) {
      if (b[key as keyof StorageEntityDataType] !== value) {
        errors.push({
          key,
          expected: value,
          actual: b[key as keyof StorageEntityDataType],
        });
      }
    }
    return { errors };
  };

  useEffect(() => {
    chrome.storage.sync.get("entities", (data) => {
      setOriginalEntities(data.entities || []);
    });
    chrome.tabs
      .query({ active: true, lastFocusedWindow: true })
      .then(([tab]) => {
        if (!tab.id) return;
        setTabId(tab.id);
      });
  }, []);

  useEffect(() => {
    if (!tabId) return;

    chrome.tabs.sendMessage(tabId, {
      action: "HIGHLIGHT_FIELDS",
      data: selectedEntity ? selectedEntity.errors : [],
    });
  }, [tabId, selectedEntity]);

  useEffect(() => {
    if (!buyerInfo) return;
    if (originalEntities.length === 0) return;

    const filteredEntities = originalEntities.filter(
      (entity: StorageEntityType) => entity.data.tin === buyerInfo.tin
    );

    // No match to any TIN
    if (filteredEntities.length === 0) {
      // TODO: Send highlight fields to the content script [tin]
      return setAlert({
        type: "info",
        title: "Info",
        description: "No matching entity found. Please check the TIN.",
      });
    }

    // Check if only one entity is found with the TIN
    if (filteredEntities.length === 1) {
      const foundEntity = filteredEntities[0];

      const { errors } = compareEntities(foundEntity.data, buyerInfo);
      setMatchedEntities([{ ...foundEntity, errors }]);

      if (errors.length > 0) {
        // Found errors for the only one entity that matched TIN
        setSelectedEntity({ ...foundEntity, errors });
        return setAlert({
          type: "warning",
          title: "Warning",
          description: "Entity found, but some details don't match.",
        });
      }

      return setAlert({
        type: "success",
        title: "Success",
        description: "Entity fully matched.",
      });
    }

    // Check if there are multiple entities found
    if (filteredEntities.length > 1) {
      let matchedEntitiesIncludedErrorsAndSort = [];

      for (const entity of filteredEntities) {
        const { errors } = compareEntities(entity.data, buyerInfo);

        if (errors.length === 0) {
          matchedEntitiesIncludedErrorsAndSort = [{ ...entity, errors }];
          break;
        }

        matchedEntitiesIncludedErrorsAndSort.push({
          ...entity,
          errors,
        });
      }

      // Sort by the number of errors
      matchedEntitiesIncludedErrorsAndSort.sort((a, b) => {
        return a.errors.length - b.errors.length;
      });
      setMatchedEntities(matchedEntitiesIncludedErrorsAndSort);
      if (matchedEntitiesIncludedErrorsAndSort.length === 1) {
        setSelectedEntity(matchedEntitiesIncludedErrorsAndSort[0]);
        return setAlert({
          type: "success",
          title: "Success",
          description: "Entity fully matched.",
        });
      }

      return setAlert({
        type: "warning",
        title: "Warning",
        description: "Multiple entities found. Please select one.",
      });
    }
  }, [buyerInfo, originalEntities]);

  useEffect(() => {
    const handleMessage = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request: { action: string; data: any },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _sender: any,
      sendResponse: (response: string) => void
    ) => {
      if (request.action === "VALIDATE_BUYER_INFO") {
        if (!request.data) {
          return setAlert({
            type: "error",
            title: "Error",
            description: "No data found.",
          });
        }

        if (originalEntities.length === 0) {
          return setAlert({
            type: "info",
            title: "Info",
            description: "No entities created. Please add entities.",
          });
        }

        setBuyerInfo(request.data);
      }
      sendResponse("received.");
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [originalEntities]);

  const columns: ColumnDef<StorageEntityWithErrorsType>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Entity",
        meta: {
          displayName: "Entity",
        },
        cell: ({ row }) => <div>{row.getValue("name")}</div>,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const entity = row.original;
          return (
            <div className="flex justify-end">
              {selectedEntity && selectedEntity.hash === entity.hash ? (
                <Button
                  variant="ghost"
                  className="p-2 ml-auto"
                  size={"icon"}
                  onClick={() => {
                    setSelectedEntity(null);
                  }}
                >
                  <SquareCheck className="size-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="p-2 ml-auto"
                  size={"icon"}
                  onClick={() => {
                    setSelectedEntity(entity);
                  }}
                >
                  <Square className="size-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [selectedEntity]
  );

  return (
    <div>
      {alert && (
        <Alert>
          {alert.type === "success" && <CircleCheck className="size-4" />}
          {alert.type === "warning" && <CircleAlert className="size-4" />}
          {alert.type === "info" && <CircleHelp className="size-4" />}
          {alert.type === "error" && <CircleX className="size-4" />}
          <AlertTitle className="font-bold">{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      )}
      {!buyerInfo && !alert && (
        <div className="mx-auto mt-4">
          <div className="text-center">
            Please refresh the page if you don't see any updates after you
            select an e-invois document.
          </div>
        </div>
      )}
      {buyerInfo && matchedEntities.length > 0 && (
        <>
          <div className="mx-auto mt-4">
            <h1 className="text-lg">Buyer Information</h1>
          </div>
          <DataTable
            columns={columns}
            data={matchedEntities}
            showCreateButton={false}
          />
        </>
      )}
    </div>
  );
}

export default LandingPage;
