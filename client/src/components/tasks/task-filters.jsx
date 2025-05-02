import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"

export function TaskFilters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Status</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="status-all" />
              <Label htmlFor="status-all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="status-completed" />
              <Label htmlFor="status-completed">Completed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="status-in-progress" />
              <Label htmlFor="status-in-progress">In Progress</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="status-pending" />
              <Label htmlFor="status-pending">Pending</Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Department</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="dept-all" />
              <Label htmlFor="dept-all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="dept-marketing" />
              <Label htmlFor="dept-marketing">Marketing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="dept-sales" />
              <Label htmlFor="dept-sales">Sales</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="dept-operations" />
              <Label htmlFor="dept-operations">Operations</Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Priority</h3>
          <RadioGroup defaultValue="all">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="priority-all" />
              <Label htmlFor="priority-all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="priority-high" />
              <Label htmlFor="priority-high">High</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="priority-medium" />
              <Label htmlFor="priority-medium">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="priority-low" />
              <Label htmlFor="priority-low">Low</Label>
            </div>
          </RadioGroup>
        </div>

        <Button className="w-full">Apply Filters</Button>
      </CardContent>
    </Card>
  )
}
