"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReportSightingForm() {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    console.log("Submitted sighting:", data);
    alert("Sighting submitted! Check the console for data.");
    reset();
  };

  return (
    <Card className="p-4 space-y-3">
      <h2 className="text-lg font-semibold">Report a Superman Sighting</h2>
      <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="lat">Latitude</Label>
            <Input id="lat" type="number" step="any" {...register("lat")} />
          </div>
          <div>
            <Label htmlFor="lng">Longitude</Label>
            <Input id="lng" type="number" step="any" {...register("lng")} />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea id="description" {...register("description")} />
        </div>
        <Button type="submit">Submit Sighting</Button>
      </form>
    </Card>
  );
}
