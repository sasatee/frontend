import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Kbd } from '@/components/ui/kbd';

export function AccessibilityGuide() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Accessibility Features Guide</CardTitle>
        <CardDescription>
          Learn about the accessibility features available in this application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold">Keyboard Navigation</h3>
              <Separator className="my-2" />
              <p className="mb-2 text-sm text-muted-foreground">
                This application supports full keyboard navigation for users who cannot use a mouse.
              </p>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Skip to main content</span>
                  <Kbd>Tab</Kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Open command menu</span>
                  <div className="flex items-center gap-1">
                    <Kbd>Ctrl</Kbd>
                    <span>+</span>
                    <Kbd>K</Kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Navigate between focusable elements</span>
                  <Kbd>Tab</Kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Activate buttons and links</span>
                  <Kbd>Enter</Kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Navigate dropdown menus</span>
                  <div className="flex items-center gap-1">
                    <Kbd>↑</Kbd>
                    <Kbd>↓</Kbd>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Screen Reader Support</h3>
              <Separator className="my-2" />
              <p className="mb-2 text-sm text-muted-foreground">
                This application is designed to work with screen readers like NVDA, JAWS, and
                VoiceOver.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="aria-labels">
                  <AccordionTrigger>ARIA Labels</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      All interactive elements have appropriate ARIA labels to ensure screen readers
                      can announce them correctly.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="live-regions">
                  <AccordionTrigger>Live Regions</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Important updates like notifications and alerts are announced to screen reader
                      users through ARIA live regions.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="form-labels">
                  <AccordionTrigger>Form Controls</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      All form fields have proper labels, error messages are linked to inputs, and
                      required fields are clearly indicated.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Visual Accessibility</h3>
              <Separator className="my-2" />
              <p className="mb-2 text-sm text-muted-foreground">
                Features to help users with visual impairments.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>High contrast mode via the theme toggle</li>
                <li>Consistent focus indicators for keyboard navigation</li>
                <li>Text resizes properly when browser zoom is used</li>
                <li>Color is not used as the only means of conveying information</li>
                <li>Icons have text alternatives</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Cognitive Accessibility</h3>
              <Separator className="my-2" />
              <p className="mb-2 text-sm text-muted-foreground">
                Features to help users with cognitive disabilities.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Consistent navigation and interface patterns</li>
                <li>Clear error messages with instructions for correction</li>
                <li>Reduced motion option for animations</li>
                <li>Simple, clear language throughout the interface</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Accessibility Statement</h3>
              <Separator className="my-2" />
              <p className="text-sm text-muted-foreground">
                We are committed to ensuring our application is accessible to all users. If you
                encounter any accessibility issues, please report them to our support team.
              </p>
            </section>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
