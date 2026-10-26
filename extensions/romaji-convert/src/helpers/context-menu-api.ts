export type MenuProps = Record<string, unknown>;
export type MenuContext = { props: MenuProps; target: Element | null };
export type RegisteredMenuItem = { register(): void; deregister(): void };

type ContextMenuApi = {
    parseProps(
        props: MenuProps,
    ): [string[], string[] | undefined, string | undefined] | undefined;
    Item: new (options: {
        children: string;
        leadingIcon: string;
        onClick(context: MenuContext): void;
        shouldAdd(
            props: MenuProps,
            trigger: string,
            target: Element | null,
        ): boolean;
    }) => RegisteredMenuItem;
};

// The repository's shared declarations predate ContextMenuV2.
export function getContextMenuApi(): ContextMenuApi | undefined {
    return (Spicetify as unknown as { ContextMenuV2?: ContextMenuApi })
        .ContextMenuV2;
}
