/* eslint-disable react-hooks/static-components */
// app/(admin)/send-message/page.tsx
"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { sendMessage } from "../send-approval/actions";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  RemoveFormatting,
  Minus,
} from "lucide-react";

export default function SendMessagePage() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sourcePrefix, setSourcePrefix] = useState("admin");

  const editor = useEditor({
    extensions: [StarterKit, Underline, CharacterCount],
    immediatelyRender: false,
    content: "<p>Write your message here...</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[250px] max-h-[500px] overflow-y-auto p-4 focus:outline-none",
      },
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const htmlContent = editor?.getHTML() || "";

    formData.append("htmlContent", htmlContent);
    formData.append("sourcePrefix", sourcePrefix);

    const res = await sendMessage(formData);

    setPending(false);
    setMessage(res?.message ?? "Something went wrong");

    if (res?.message === "Message sent successfully") {
      editor?.commands.setContent("<p>Write your message here...</p>");
      e.currentTarget?.reset();
    }
  }

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex justify-center py-16 px-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl">Send Email Message</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Source Email Prefix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="sourcePrefix">From (Source Email)</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={sourcePrefix}
                    onValueChange={setSourcePrefix}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">admin</SelectItem>
                      <SelectItem value="support">support</SelectItem>
                      <SelectItem value="info">info</SelectItem>
                      <SelectItem value="noreply">noreply</SelectItem>
                      <SelectItem value="leasing">leasing</SelectItem>
                      <SelectItem value="approval">approval</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    @InvitationHomerealty.com
                  </span>
                </div>
              </div>

              {/* Destination Email */}
              <div className="space-y-1">
                <Label htmlFor="destination">To (Destination Email)</Label>
                <Input
                  id="destination"
                  name="destination"
                  type="email"
                  placeholder="recipient@email.com"
                  required
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Email subject"
                required
              />
            </div>

            {/* TipTap Editor */}
            <div className="space-y-1">
              <Label>Message</Label>
              <div className="border rounded-lg overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
                  {/* Text Formatting */}
                  <div className="flex items-center gap-0.5">
                    <ToolbarButton
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      isActive={editor.isActive("bold")}
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      isActive={editor.isActive("italic")}
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                      }
                      isActive={editor.isActive("underline")}
                      title="Underline (Ctrl+U)"
                    >
                      <UnderlineIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() =>
                        editor.chain().focus().toggleStrike().run()
                      }
                      isActive={editor.isActive("strike")}
                      title="Strikethrough"
                    >
                      <Strikethrough className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() => editor.chain().focus().toggleCode().run()}
                      isActive={editor.isActive("code")}
                      title="Inline Code"
                    >
                      <Code className="h-4 w-4" />
                    </ToolbarButton>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Headings */}
                  <div className="flex items-center gap-0.5">
                    <ToolbarButton
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                      }
                      isActive={editor.isActive("heading", { level: 1 })}
                      title="Heading 1"
                    >
                      <Heading1 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                      }
                      isActive={editor.isActive("heading", { level: 2 })}
                      title="Heading 2"
                    >
                      <Heading2 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                      }
                      isActive={editor.isActive("heading", { level: 3 })}
                      title="Heading 3"
                    >
                      <Heading3 className="h-4 w-4" />
                    </ToolbarButton>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Lists & Blocks */}
                  <div className="flex items-center gap-0.5">
                    <ToolbarButton
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      isActive={editor.isActive("bulletList")}
                      title="Bullet List"
                    >
                      <List className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                      isActive={editor.isActive("orderedList")}
                      title="Numbered List"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                      }
                      isActive={editor.isActive("blockquote")}
                      title="Quote"
                    >
                      <Quote className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                      }
                      isActive={editor.isActive("codeBlock")}
                      title="Code Block"
                    >
                      <Code className="h-4 w-4" />
                    </ToolbarButton>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* History */}
                  <div className="flex items-center gap-0.5">
                    <ToolbarButton
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                      title="Redo (Ctrl+Shift+Z)"
                    >
                      <Redo className="h-4 w-4" />
                    </ToolbarButton>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Clear Formatting */}
                  <div className="flex items-center gap-0.5">
                    <ToolbarButton
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .clearNodes()
                          .unsetAllMarks()
                          .run()
                      }
                      title="Clear Formatting"
                    >
                      <RemoveFormatting className="h-4 w-4" />
                    </ToolbarButton>
                  </div>

                  {/* Horizontal Rule */}
                  <div className="ml-auto">
                    <ToolbarButton
                      onClick={() =>
                        editor.chain().focus().setHorizontalRule().run()
                      }
                      title="Insert Horizontal Rule"
                    >
                      <Minus className="h-4 w-4" />
                    </ToolbarButton>
                  </div>
                </div>

                {/* Editor */}
                <div className="bg-background">
                  <EditorContent editor={editor} />
                </div>

                {/* Character Count */}
                <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex justify-between items-center">
                  <span>
                    {editor.storage.characterCount.characters()} characters
                  </span>
                  <span>{editor.storage.characterCount.words()} words</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={pending}
              className="w-full"
              size="lg"
            >
              {pending ? "Sending..." : "Send Message"}
            </Button>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm text-center ${
                  message === "Message sent successfully"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
