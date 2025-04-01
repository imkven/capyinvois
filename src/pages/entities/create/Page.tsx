import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatISO } from "date-fns";
import { Link, useNavigate } from "react-router";
import { X } from "lucide-react";
import stringify from "safe-stable-stringify";
import XXH from "xxhashjs";
import { Card, CardHeader } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  CreateEntitySchema,
  CreateEntityType,
  StorageEntityType,
  StorageType,
} from "../../../schema";
import { useToast } from "../../../hooks/use-toast";
import FormEntity from "../../../components/form-entity";

function CreateEntityPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const normaliseAddress = (addressLine: string) => {
    const address = addressLine
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v)
      .reverse();
    const addressAfterRemovedMandatory = address.slice(3, address.length);
    const postcode = Number.isNaN(addressAfterRemovedMandatory[0])
      ? ""
      : addressAfterRemovedMandatory[0];
    const addressAfterRemovedPostcode = addressAfterRemovedMandatory
      .slice(1, addressAfterRemovedMandatory.length)
      .reverse();

    return {
      country: address[0],
      state: address[1],
      city: address[2],
      postcode: postcode,
      line1: addressAfterRemovedPostcode[0],
      line2: addressAfterRemovedPostcode[1] ?? "",
      line3: addressAfterRemovedPostcode[2] ?? "",
    };
  };

  const form = useForm<CreateEntityType>({
    resolver: zodResolver(CreateEntitySchema),
  });

  function onSubmit(values: CreateEntityType) {
    const { entity: entityName, ...rawData } = values;
    chrome.storage.sync.get<StorageType>("entities", ({ entities }) => {
      const foundEntity = (entities ?? []).find(
        (entity) => entity.name === entityName
      );
      if (foundEntity) {
        toast({
          title: "Error",
          description:
            "Entity already exists. Please use a different entity name.",
        });
        return;
      }

      const data = {
        ...rawData,
        normalisedAddress: normaliseAddress(rawData.address),
      };

      const stringified = stringify(data);
      const hash = XXH.h32().update(stringified).digest().toString(16);

      // Check duplicated data
      const foundHash = (entities ?? []).find((entity) => entity.hash === hash);
      if (foundHash) {
        toast({
          title: "Error",
          description: "Entity content is duplicated.",
        });
        return;
      }

      // Save into entities
      const formattedEntity: StorageEntityType = {
        data: JSON.parse(stringified),
        name: entityName,
        hash,
        createdAt: formatISO(new Date()),
        updatedAt: formatISO(new Date()),
      };
      chrome.storage.sync
        .set<StorageType>({ entities: [{ ...formattedEntity }, ...entities] })
        .then(() => {
          toast({
            title: "Done",
            description: "Entity is created.",
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
            <h2 className="text-2xl font-bold">New Entity</h2>
            <Button variant="outline" className="p-4" asChild>
              <Link to="/entities" className="ml-auto">
                <X />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <FormEntity form={form} onSubmit={onSubmit} buttonText="Create" />
      </Card>
    </div>
  );
}

export default CreateEntityPage;
