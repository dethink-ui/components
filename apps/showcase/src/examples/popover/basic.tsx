"use client";

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@dethink/components";

export function PopoverBasic() {
  return (
    <div className="flex justify-center">
      <Popover>
        <PopoverTrigger variant="outline">Share dashboard</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Share dashboard</PopoverTitle>
            <PopoverDescription>
              Anyone in the workspace can view. Focus moves inside and
              returns to the trigger on close.
            </PopoverDescription>
          </PopoverHeader>
          <PopoverFooter>
            <PopoverClose variant="outline">Done</PopoverClose>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </div>
  );
}
