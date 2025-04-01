import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatISO } from "date-fns";
import { Link, useNavigate, useParams } from "react-router";
import { X } from "lucide-react";
import stringify from "safe-stable-stringify";
import XXH from "xxhashjs";
import { Card, CardHeader } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  EditEntitySchema,
  EditEntityType,
  StorageEntityType,
  StorageType,
} from "../../../schema";
import { useToast } from "../../../hooks/use-toast";
import FormEntity from "../../../components/form-entity";

function EditEntityPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hash } = useParams<{ hash: string }>();

  const form = useForm<EditEntityType>({
    resolver: zodResolver(EditEntitySchema),
    defaultValues: async () =>
      new Promise((resolve, reject) => {
        if (!hash) {
          return reject("Entity not found.");
        }
        chrome.storage.sync.get<StorageType>("entities", ({ entities }) => {
          const foundEntity = (entities ?? []).find(
            (entity) => entity.hash === hash
          );
          if (!foundEntity) {
            return reject("Entity not found.");
          }
          return resolve({ ...foundEntity.data, entity: foundEntity.name });
        });
      }),
  });

  if (form.formState.isLoading) {
    return <div>Loading...</div>;
  }

  function onSubmit(values: EditEntityType) {
    const { entity: entityName, ...data } = values;
    chrome.storage.sync.get<StorageType>("entities", ({ entities }) => {
      const foundOriginalEntity = (entities ?? []).find(
        (entity) => entity.hash === hash
      );
      if (!foundOriginalEntity) {
        toast({
          title: "Error",
          description: "Entity not found.",
        });
        navigate("/entities");
        return;
      }

      if (entityName !== foundOriginalEntity.name) {
        // Check if entity name already exists
        const foundEntityByName = (entities ?? []).find(
          (entity) => entity.name === entityName
        );
        if (foundEntityByName) {
          toast({
            title: "Error",
            description:
              "Entity already exists. Please use a different entity name.",
          });
          return;
        }
      }

      // Create hash
      const stringified = stringify(data);
      const newHash = XXH.h32().update(stringified).digest().toString(16);

      if (newHash !== hash) {
        // Check duplicated data
        const foundDuplicatedHash = (entities ?? []).find(
          (entity) => entity.hash === newHash
        );
        if (foundDuplicatedHash) {
          toast({
            title: "Error",
            description: "Entity content is duplicated.",
          });
          return;
        }
      }

      // Save into entities
      const formattedEntity: StorageEntityType = Object.assign(
        {},
        foundOriginalEntity,
        {
          data: JSON.parse(stringified),
          name: entityName,
          hash: newHash,
          createdAt: foundOriginalEntity.createdAt,
          updatedAt: formatISO(new Date()),
        }
      );
      const filteredEntities = (entities ?? []).filter(
        (entity) => entity.hash !== hash
      );
      chrome.storage.sync
        .set<StorageType>({
          entities: [{ ...formattedEntity }, ...filteredEntities],
        })
        .then(() => {
          toast({
            title: "Done",
            description: "Entity is updated.",
          });
          navigate("/entities");
        });
    });
  }

  return (
    <div className="flex justify-center bg-secondary-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Edit Entity</h2>
            <Button variant="outline" className="p-4" asChild>
              <Link to="/entities" className="ml-auto">
                <X />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <FormEntity form={form} onSubmit={onSubmit} buttonText="Update" />
      </Card>
    </div>
  );
}

export default EditEntityPage;
