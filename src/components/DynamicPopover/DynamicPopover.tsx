import React, {
  useEffect,
  useState,
  isValidElement,
  cloneElement,
  ReactNode,
} from 'react'
import {
  shift,
  flip,
  offset as offsetFn,
  autoUpdate,
} from '@floating-ui/react-dom'
import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  Props,
} from '@floating-ui/react-dom-interactions'

export interface IDynamicPopover {
  children: ReactNode
  popover: ReactNode
  placement?: Props['placement']
  offset?: number
  padding?: number
  zIndex?: number
  onOpenChange?: (open: boolean) => void
}

const DynamicPopover = ({
  popover,
  children,
  placement = 'top-end',
  offset = 10,
  padding = 20,
  zIndex = 100,
  onOpenChange,
}: IDynamicPopover) => {
  const [open, setOpen] = useState(false)

  const { x, y, reference, floating, strategy, update, refs, context } =
    useFloating({
      open,
      onOpenChange: (_open) => {
        setOpen(_open)
        if (onOpenChange) onOpenChange(_open)
      },
      placement,
      middleware: [offsetFn(offset), shift({ padding }), flip({ padding })],
    })

  // Attach the autoUpdate events. It's important that both refs are existing before attaching events.
  // Hence why we wait until the popover is open before attaching.
  useEffect(() => {
    if (open && refs.reference.current && refs.floating.current) {
      autoUpdate(refs.reference.current, refs.floating.current, update)
    }
  }, [refs.reference, refs.floating, update, open])

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ])

  return (
    <>
      {isValidElement(children) &&
        cloneElement(children, getReferenceProps({ ref: reference }))}
      {open &&
        isValidElement(popover) &&
        cloneElement(
          popover,
          getFloatingProps({
            ref: floating,
            style: {
              position: strategy,
              left: x ?? '',
              top: y ?? '',
              zIndex,
            },
          }),
        )}
    </>
  )
}

export default DynamicPopover
