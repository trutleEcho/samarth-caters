"use client"

import { useState } from "react"
import DateTimePicker from "./datetime-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Demo() {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Date & Time Picker</h1>
          <p className="text-muted-foreground">
            Select both date and time in a single, intuitive component
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Schedule an Event</CardTitle>
            <CardDescription>
              Choose when you'd like your event to take place
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DateTimePicker
              value={selectedDateTime}
              onChange={setSelectedDateTime}
              placeholder="Select event date and time"
            />
            
            {selectedDateTime && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected Date & Time:</p>
                <p className="text-lg">{selectedDateTime.toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meeting Reminder</CardTitle>
            </CardHeader>
            <CardContent>
              <DateTimePicker placeholder="Set reminder time" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deadline</CardTitle>
            </CardHeader>
            <CardContent>
              <DateTimePicker placeholder="Choose deadline" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
