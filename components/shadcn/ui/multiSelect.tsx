"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@components/shadcn/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@components/shadcn/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { v4 as uuidv4 } from "uuid";
import { ITag } from "interfaces";

export function MultiSelect({
    items, 
    setItems,
    selectedItems, 
    setSelectedItems,
    saveNewItem,
} : {
    items: ITag[];
    setItems: React.Dispatch<React.SetStateAction<ITag[]>>;
    selectedItems: ITag[];
    setSelectedItems: React.Dispatch<React.SetStateAction<ITag[]>>;
    saveNewItem: (newTag: ITag) => Promise<ITag | null>;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
//   const [selected, setSelected] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState("");
    // console.log("selected items: ", selectedItems);
  const handleUnselect = React.useCallback((item: ITag) => {
    // console.log("updated selected: ", item, selectedItems);
    const updatedSelected = selectedItems.filter(s => s.tagName != item.tagName);
    // console.log("updated selected: ", item, updatedSelected);
    setSelectedItems(updatedSelected);
  }, [selectedItems]);

  const handleKeyDown = React.useCallback(
    async (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            let newSelected = selectedItems;
            newSelected.pop();
            setSelectedItems(newSelected/* (prev) => {
              const newSelected = [...prev];
              newSelected.pop();
              return newSelected;
            } */);
          }
        }
        // This is not a default behaviour of the <input /> field
        if (e.key === "Escape") {
          input.blur();
        }
        if (e.key === "Enter") {
          if (input.value!== "" && selectedItems.length < 4) {
              // Check if the same tag exists
              const sameItems = items.filter(item => item.tagName.toLowerCase() == input.value.toLowerCase());
              // console.log("same items length: ", sameItems);
              if (!sameItems.length) {
                // console.log("same item exists?");
                const newTag = await saveNewItem({id: uuidv4(), tagName: input.value});
                if (newTag) {
                    setSelectedItems((prev) => [...prev, newTag]);
                    setItems((prev) => [...prev, newTag]);
                }
              }
              setInputValue("");
          }
        }
      }
    },
    [selectedItems, items]
  );

  const selectables = items.filter(
    (item) => !selectedItems.includes(item)
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selectedItems.map((item) => {
            return (
              <Badge key={item.id} variant="secondary">
                {item.tagName.toUpperCase()}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(item);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(item)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder="Select tags..."
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        <CommandList>
          {open && selectables.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full overflow-auto">
                {selectables.map((item) => {
                  return (
                    <CommandItem
                      key={item.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={(value) => {
                        setInputValue("");
                        if (selectedItems.length < 4)
                          setSelectedItems((prev) => [...prev, item]);
                      }}
                      className={"cursor-pointer"}
                    >
                      {item.tagName}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ) : null}
        </CommandList>
      </div>
    </Command>
  );
}