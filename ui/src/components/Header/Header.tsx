import { Flex, Heading } from "@chakra-ui/react";

interface HeaderProps {
  title?: string | undefined;
  subline?: string | undefined;
}

export function Header({ title, subline }: HeaderProps) {
  return (
    <div className="title-section">
      <Heading as="h1" color="white" size="md" mb={1.5}>
        {title ?? "Loading..."}
      </Heading>
      <Flex justifyContent="space-between">
        <Heading as="h2" size="md" fontWeight="thin">
          {subline}
        </Heading>
      </Flex>
    </div>
  );
}
