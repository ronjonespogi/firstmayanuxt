<template>
  <div>
  <b-navbar toggleable="lg" type="dark" variant="info">
    <b-navbar-brand href="#">MayaRiver</b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>


      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
      <b-navbar-nav>
        <b-nav-item href="#">Item</b-nav-item>
      </b-navbar-nav>

        <b-nav-item-dropdown right>
          <!-- Using 'button-content' slot -->
          <template #button-content>
            <em>User</em>
          </template>
          <b-dropdown-item href="#">Profile</b-dropdown-item>
          <b-dropdown-item href="#">Sign Out</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</div>

</template>

<script>
  export default {

  }
</script>

<style scoped>

</style>
